'use client';

/* eslint-disable no-param-reassign */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-underscore-dangle */
import {
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  Icon,
  IconButton,
  Image,
  // Spinner,
  Stack,
  Tooltip,
  useDisclosure,
} from '@chakra-ui/react';
import { CONFIG, DEFAULT_HAT, ZERO_ID } from '@hatsprotocol/constants';
import {
  hatIdDecimalToHex,
  hatIdDecimalToIp,
  hatIdHexToDecimal,
  hatIdIpToDecimal,
} from '@hatsprotocol/sdk-v1-core';
import { useTreeForm } from 'contexts';
import * as d3 from 'd3';
import { OrgChart } from 'd3-org-chart';
import { useWearerDetails } from 'hats-hooks';
import { calculateNextChildId, isTopHatOrMutable } from 'hats-utils';
import { find, get, includes, isEmpty, isUndefined, map } from 'lodash';
import { useSearchParams } from 'next/navigation';
import posthog from 'posthog-js';
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { FaMinus, FaPlus } from 'react-icons/fa';
import { idToIp, ipToHatId } from 'shared';
import type { OrgChartHat } from 'types';
import { Hex } from 'viem';
import { useAccount, useChainId } from 'wagmi';

import { buttonContent } from './buttons';
import { selectedOptionContent } from './options';
import {
  adjustAfterNodeExpanded,
  centerChart,
  checkParentElementForClass,
  recreateNodesCollapse,
} from './utils';

function OrgChartComponent() {
  const params = useSearchParams();
  const hatId = params.get('hatId');
  const selectedHatId = hatId
    ? hatIdDecimalToHex(hatIdIpToDecimal(hatId || ''))
    : undefined;
  const userChain = useChainId();
  const { address } = useAccount();
  const {
    chainId,
    editMode,
    treeToDisplay,
    orgChartTree,
    selectedOption,
    handleFlipChart,
    handleSetCompact,
    handleNodeCollapsedOrExpanded,
    handleExpandAll,
    // isLoading,
    storedConfig,
    storedData,
    queryParams,
    addHat,
    orgChartWearers,
    onOpenHatDrawer,
    onCloseTreeDrawer,
    treeError,
  } = useTreeForm();

  const d3Container = useRef(null);
  const [chart] = useState<OrgChart<unknown> | null>(new OrgChart());
  const initialLoad = useRef<boolean>(true);
  const [chartNodes, setChartNodes] = useState<OrgChartHat[] | undefined>();
  const { data: wearerHats } = useWearerDetails({
    wearerAddress: address as Hex,
    chainId,
    editMode,
  });

  const initialCompact = get(queryParams, 'compact') || storedConfig?.compact;
  const initialFlipped = get(queryParams, 'flipped') || storedConfig?.flipped;

  const collapsedNodes = useMemo(() => {
    let collapsed = get(queryParams, 'collapsed')
      ?.map((ipId) => ipToHatId(ipId))
      .sort() // sorting so that the order of processing will be identical to the order of the node collapses by the user
      .reverse();
    if (collapsed?.length === 0 && storedConfig.collapsed !== undefined) {
      collapsed = storedConfig.collapsed.map((ipId) => ipToHatId(ipId));
    }
    return collapsed ?? [];
  }, [queryParams, storedConfig]);

  const { isOpen: compact, onToggle: toggleCompact } = useDisclosure({
    defaultIsOpen: initialCompact,
  });
  const { isOpen: flipped, onToggle: toggleFlip } = useDisclosure({
    defaultIsOpen: initialFlipped,
  });

  // update chartNodes each time treeToDisplay is changed, but keep the internal org chart state variables (properties that start with "_")
  useEffect(() => {
    if (chartNodes === undefined && treeToDisplay !== undefined) {
      setChartNodes(treeToDisplay);
      return;
    }

    if (chartNodes !== undefined && treeToDisplay !== undefined) {
      const newChartNodes = treeToDisplay as OrgChartHat[];
      chartNodes.forEach((node) => {
        const newNode: OrgChartHat | undefined = find(newChartNodes, {
          id: node.id,
        });
        if (isUndefined(newNode)) return;

        // eslint-disable-next-line no-restricted-syntax
        for (const [key, value] of Object.entries(node)) {
          // TODO can this be more specific? it's potentially causing data to stick when nodes are collapsed
          if (!key.startsWith('_')) return;
          // @ts-expect-error why does it think this is never?
          newNode[key as keyof OrgChartHat] = value as any;
        }
      });

      setChartNodes(newChartNodes);
    }
  }, [chartNodes, treeToDisplay, orgChartTree]);

  useEffect(() => {
    // encode the collapsed nodes in the tree to display, used for custom manipulation of expanded/collapsed nodes
    if (isUndefined(chartNodes)) return;

    for (let i = 0; i < chartNodes.length; i += 1) {
      chartNodes[i]._collapsed = false;
    }
    collapsedNodes.forEach((node: string) => {
      const hatToUpdate = find(chartNodes, {
        id: node,
      }) as OrgChartHat;
      if (isUndefined(hatToUpdate)) return;

      hatToUpdate._collapsed = true;
    });
  }, [chartNodes, collapsedNodes]);

  useLayoutEffect(() => {
    if (isEmpty(chartNodes)) return;

    if (chart && chartNodes && d3Container.current) {
      chart
        .container(d3Container.current)
        .data(chartNodes ?? [])
        // set dims of the chart window
        .svgHeight(window.innerHeight - 150)
        .svgWidth(window.innerWidth)
        // margin from top for root node
        .rootMargin(80)
        .siblingsMargin(() => 40)
        .neighbourMargin(() => 40)
        // set node sizes
        .nodeHeight(() => {
          if (editMode || selectedOption !== 'title') {
            return 110;
          }
          return 70;
        })
        .nodeWidth(() => 220)
        // eslint-disable-next-line func-names
        .nodeUpdate(function (this: any) {
          if (!chainId || !orgChartTree) return;
          d3.select(this).on('click.node-update', (event: any, data: any) => {
            if (checkParentElementForClass(event, `click-${data.data.name}`)) {
              const nextChildId = calculateNextChildId(
                data.data.id,
                orgChartTree,
              );
              const newId = ipToHatId(nextChildId);

              const newHat = {
                ...DEFAULT_HAT,
                chainId,
                id: newId,
                admin: {
                  id: data.data.id,
                },
                imageUri: '',
                imageUrl: '/icon.jpeg',
                parentId: data.data.id,
                name: nextChildId,
                detailsObject: {
                  type: '1.0',
                  data: {
                    name: 'New Hat',
                  },
                },
              };

              addHat?.(newHat, data.data.id);

              // still not having luck centering new nodes here
              // always node not found or parent node
            } else {
              // don't center here
              posthog.capture('Opened Hat Drawer', {
                chain_id: chainId,
                hat_id: data.data.id,
                tree_id: '',
                hat_name: '',
                draft: false,
                edit_mode: editMode,
                from: 'Org Chart',
              });
              onOpenHatDrawer?.(data.data.id);
              onCloseTreeDrawer?.();
            }
          });
        })
        // eslint-disable-next-line func-names
        .linkUpdate(function (this: any) {
          d3.select(this).attr('stroke', '#718096');
          // handle linked links?
        })
        .buttonContent((d) => buttonContent(d))
        .nodeContent((d: any) => {
          const isInWearerHats = includes(map(wearerHats, 'id'), d.data.id);

          const {
            imageUrl,
            name,
            details,
            detailsObject,
            isLinked,
            maxSupply,
            currentSupply,
            hatChartWearers,
            eligibility,
            toggle,
            levelAtLocalTree,
          } = d.data;

          const nextChildId = calculateNextChildId(d.data.id, chartNodes);
          const currentName = find(chartNodes, {
            id: d.data.id,
          })?.displayName;
          const detailsName =
            currentName || detailsObject?.data?.name || details;
          const isSelected = selectedHatId === d.id;
          const extendedEligibility = find(orgChartWearers, {
            id: eligibility,
          });
          const extendedToggle = find(orgChartWearers, {
            id: toggle,
          });
          const nodeIpUnderScore = hatIdDecimalToIp(
            hatIdHexToDecimal(d.data.id),
          ).replaceAll('.', '_');

          return `
            <div style='
              width: ${d.width}px;
              height: ${d.height}px;
              padding-left: 1px;
              padding-right: 1px;'
              id='node-${nodeIpUnderScore}'
            >
              <div style="
                display: flex;
                flex-direction: column;
                align-items: center;
                background-color: white;
                border: 
                  ${isSelected ? '3px' : '1px'} 
                  ${isLinked ? 'dotted' : 'solid'} #4A5568;
                border-radius: 4px;
                width: ${d.width}px;
                height: ${d.height}px;
                overflow: hidden;
                box-shadow: ${
                  // TODO use image instead of box shadow
                  isSelected
                    ? '0px 25px 50px -12px rgba(0, 0, 0, 0.25)'
                    : '0px 2px 4px -1px rgba(0, 0, 0, 0.06), 0px 4px 6px -1px rgba(0, 0, 0, 0.10)'
                };
              ">
                <div style="
                  width: 100%;
                  display: flex;
                  align-items: center;
                  position: relative;
                ">
                  <div style="
                    position: fixed;
                    width: ${isSelected ? '88px' : '70px'};
                    height: ${isSelected ? '88px' : '70px'};
                    border: ${isSelected ? '3px' : '1px'} solid #4A5568;
                    left: ${isSelected ? -12 : 1}px;
                    top: ${isSelected ? -12 : 0}px;
                    ${
                      isSelected
                        ? 'border-radius: 4px;'
                        : 'border-top-left-radius: 4px;'
                    }
                    overflow: hidden;
                    ${isSelected && 'background: white;'}
                  ">
                    <img
                      loading="lazy"
                      src="${
                        imageUrl &&
                        imageUrl !== '' &&
                        imageUrl !== '#' &&
                        imageUrl !== null
                          ? imageUrl
                          : '/icon.jpeg'
                      }"
                      style="
                        background: white;
                        height: ${isSelected ? '102%' : '100%'};
                        object-fit: cover;
                        left: ${isSelected ? -4 : -1}px;
                        top: ${isSelected ? -4 : -1}px;
                        opacity: ${imageUrl === null ? 0.5 : 1};"
                    />
                  </div>
                  <div style="
                    display: flex;
                    flex-direction: column;
                    height: 100%;
                    width: 70%;
                    position: relative;
                    margin-left: 70px;"
                  >
                    <div style="
                      display: flex;
                      flex-direction: column;
                      position: absolute;
                      left: ${isSelected ? 8 : 10}px;
                      top: ${isSelected ? 9 : 10}px;"
                      
                    >
                      <div style="display: flex; flex-direction: row; justify-content: space-between; width: 100%;">
                        <div style="
                          font-size: 12px;
                          font-family: 'Inter Variable', sans-serif;
                          color: #08011E;
                          font-weight: ${isSelected ? 800 : 500};
                        ">
                          ${name}
                        </div>
                        ${
                          editMode && !isTopHatOrMutable(d.data)
                            ? `<div style="border: 1px solid #A0AEC0; padding: 1px 3px;">
                                <div style="font-size: 8px; color: #A0AEC0;">IMMUTABLE</div>
                              </div>`
                            : ''
                        }
                      </div>
                      <div style="
                        display: -webkit-box;
                        font-size: 16px;
                        font-family: 'Inter Variable', sans-serif;
                        font-weight: ${isSelected ? 800 : 500};
                        overflow: hidden;
                        color: #08011E;
                        width: 120px;
                        -webkit-line-clamp: 2;
                        -webkit-box-orient: vertical;"
                      >
                        ${detailsName}
                      </div>
                    </div>
                    ${
                      // TODO need to re-check eligibility here
                      isInWearerHats
                        ? `<img src='/icons/hat.svg'
                            style="
                              width: 16px;
                              height: 12px;
                              position: absolute;
                              right: 10px;
                              top: 10px;"
                        />`
                        : ''
                    }
                  </div>
                </div>
                ${
                  !editMode
                    ? selectedOptionContent({
                        selectedOption,
                        currentSupply,
                        maxSupply,
                        hatChartWearers,
                        extendedEligibility,
                        extendedToggle,
                        levelAtLocalTree,
                      })
                    : `<div style="
                    margin-top: 68px;
                    width: 100%;
                    height: 40px;
                    border-top: 1px solid #4A5568;
                    background-color: #C4F1F9;
                    padding: 10px;
                    display: flex;
                    flex-direction: row;
                    align-items: center;
                    justify-content: space-between;
                  "
                    class="click-${name}">
                    <div style="
                      display: flex;
                      width: 100%;
                      justify-content: flex-end;
                      align-items: center;
                      flex-direction: row;
                      gap: 4px;
                      font-size: 14px;
                      font-family: 'Inter Variable', sans-serif;
                      position: relative;
                    " class="hover-text">
                      <div style="
                        display: block;
                        background: white;
                        border-radius: 2px;
                        height: 14px;
                        width: 14px;
                      ">
                        <img src="/icons/plus-square.svg" alt="add" style="height: 100%;" />
                      </div>
                      ${
                        levelAtLocalTree > 3
                          ? `
                              <div class="tooltip">
                                #${nextChildId}
                              </div>
                            `
                          : ''
                      }
                      
                      <div style="
                        display: -webkit-box;
                        overflow: hidden;
                        width: 180px;
                        -webkit-line-clamp: 1;
                        -webkit-box-orient: vertical;
                      ">
                        Add Hat ${nextChildId}
                      </div>
                    </div>
                  </div>`
                }
              </div>
            </div>`;
        })
        .compact(compact)
        .layout(flipped ? 'bottom' : 'top')
        .onExpandOrCollapse((d: any) => {
          if (handleNodeCollapsedOrExpanded === undefined) return;

          const isExpanded = d.children !== null;
          handleNodeCollapsedOrExpanded(idToIp(d.data.id), isExpanded);

          if (isExpanded) {
            d.data._collapsed = false;
            adjustAfterNodeExpanded(d);
          } else {
            d.data._collapsed = true;
          }
        });

      if (isEmpty(collapsedNodes)) {
        chart.expandAll(); // keep nodes expanded on edit mode. Note that expandAll performs a render so no need to call render again
      } else if (initialLoad.current) {
        // initial rendering with collapsed nodes
        if (chartNodes !== undefined) {
          collapsedNodes.forEach((node) => {
            const hatToUpdate = find(chartNodes, { id: node });
            if (hatToUpdate !== undefined) {
              (hatToUpdate as any)._collapsed = true;
            }
          });
        }
        chart.expandAll();
        recreateNodesCollapse(chart, collapsedNodes);
      }

      if (!initialLoad.current) return;

      if (
        selectedHatId &&
        selectedHatId !== ZERO_ID &&
        selectedHatId !== '0x'
      ) {
        onOpenHatDrawer?.(selectedHatId);
        centerChart(chart, selectedHatId);
      } else {
        chart.fit();
      }

      initialLoad.current = false;
    }
  }, [
    chart,
    chainId,
    selectedHatId,
    storedData,
    wearerHats,
    selectedOption,
    editMode,
    orgChartTree,
    userChain,
    chartNodes,
    compact,
    flipped,
    orgChartWearers,
    collapsedNodes,
    addHat,
    onOpenHatDrawer,
    onCloseTreeDrawer,
    handleNodeCollapsedOrExpanded,
  ]);

  if (treeError) {
    // TODO check more specific error message
    return (
      <Flex justify='center' align='center' w='full' h='full' pt='175px'>
        <Stack spacing={8} align='center'>
          <Stack>
            <Heading size='4xl' textAlign='center'>
              404
            </Heading>
            <Heading textAlign='center'>Tree not found</Heading>

            {/* <Flex>
                <ChakraNextLink href='/'>
                  <Button
                    variant='outline'
                    bg='white'
                    rightIcon={<Icon as={BsArrowRight} />}
                  >
                    <span role='img' aria-label='Hats ball cap'>
                      🧢
                    </span>{' '}
                    Head home
                  </Button>
                </ChakraNextLink>
              </Flex> */}
          </Stack>

          <Image src='/tree-not-found.png' alt='No hats found' h='500px' />
        </Stack>
      </Flex>
    );
  }

  // TODO re-enable
  // if (isLoading) {
  //   // hitting this flow?
  //   return (
  //     <Flex
  //       h='calc(100% - 200px)'
  //       w='100%'
  //       alignItems='center'
  //       justifyContent='center'
  //     >
  //       <Spinner size='xl' />
  //     </Flex>
  //   );
  // }

  return (
    <Box position='relative' pt='145px' minH='100vh' h='calc(100% + 5px)'>
      <div
        style={{
          overflow: 'hidden',
          height: '100%',
        }}
        ref={d3Container}
        id='d3Container'
      />

      <HStack position='absolute' bottom={4} left={85}>
        <Button
          variant='outline'
          bg={editMode ? '#C4F1F9' : 'whiteAlpha.800'}
          onClick={() => {
            chart?.expandAll();
            chart?.fit();
            handleExpandAll?.();
          }}
        >
          Show full {CONFIG.tree}
        </Button>
        <Tooltip
          label={
            !isEmpty(collapsedNodes)
              ? `Show full tree to ${compact ? 'expand' : 'compact'} view`
              : ''
          }
        >
          <Button
            onClick={() => {
              posthog.capture('Toggled Compact View', {
                compact,
              });

              toggleCompact();
              handleSetCompact?.(compact);
            }}
            isDisabled={!isEmpty(collapsedNodes)} // add edit mode here?
            variant='outline'
            bg={editMode ? '#C4F1F9' : 'whiteAlpha.800'}
          >
            {compact ? 'Full View' : 'Compact View'}
          </Button>
        </Tooltip>
        <Tooltip
          label={!isEmpty(collapsedNodes) ? 'Show full tree to flip view' : ''}
        >
          <Button
            onClick={() => {
              posthog.capture('Toggled Flip View', {
                flipped,
              });
              toggleFlip();
              handleFlipChart?.(flipped);
              setTimeout(() => {
                chart?.fit();
              }, 50);
            }}
            isDisabled={!isEmpty(collapsedNodes)} // add edit mode here?
            variant='outline'
            bg={editMode ? '#C4F1F9' : 'whiteAlpha.800'}
          >
            Flip Tree
          </Button>
        </Tooltip>
        <HStack>
          <IconButton
            icon={<Icon as={FaMinus} />}
            variant='ghost'
            bg={editMode ? '#C4F1F9' : 'whiteAlpha.800'}
            aria-label='zoom out'
            onClick={() => chart?.zoomOut()}
          />
          <IconButton
            icon={<Icon as={FaPlus} />}
            variant='ghost'
            bg={editMode ? '#C4F1F9' : 'whiteAlpha.800'}
            aria-label='zoom in'
            onClick={() => chart?.zoomIn()}
          />
        </HStack>
      </HStack>
    </Box>
  );
}

export default OrgChartComponent;
