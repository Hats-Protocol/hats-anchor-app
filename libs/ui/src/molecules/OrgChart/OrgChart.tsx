/* eslint-disable no-param-reassign */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-underscore-dangle */
import {
  Box,
  Button,
  Flex,
  HStack,
  Icon,
  IconButton,
  Spinner,
  useDisclosure,
} from '@chakra-ui/react';
import { CONFIG, DEFAULT_HAT, ZERO_ID } from '@hatsprotocol/constants';
import { useTreeForm } from 'contexts';
import * as d3 from 'd3';
import { OrgChart } from 'd3-org-chart';
import { useWearerDetails } from 'hats-hooks';
import { calculateNextChildId, isTopHatOrMutable } from 'hats-utils';
import { useHatParams, useToast } from 'hooks';
import _ from 'lodash';
import React, { useEffect, useRef, useState } from 'react';
import { FaMinus, FaPlus } from 'react-icons/fa';
import { idToIp, ipToHatId } from 'shared';
import type { AppHat } from 'types';
import { formatAddress } from 'utils';
import { useAccount, useChainId } from 'wagmi';

function checkParentElementForClass(e: any, name: string) {
  let element = e.srcElement;
  let n = 0;
  while (element) {
    if (n > 5) break;
    const classArray = _.split(element.classList.value, ' ');
    if (classArray && _.includes(classArray, name)) {
      return true;
    }
    element = element.parentNode;
    n += 1;
  }
  return false;
}

const OrgChartComponent: React.FC = () => {
  const userChain = useChainId();
  const toast = useToast();
  const { address } = useAccount();
  const {
    chainId,
    editMode,
    treeToDisplay,
    showInactiveHats,
    selectedOption,
    handleFlipChart,
    handleSetCompact,
    handleNodeCollapsedOrExpanded,
    isLoading,
    storedConfig,
    storedData,
    setStoredData,
    addHat,
    orgChartWearers,
    onOpenHatDrawer,
    onCloseTreeDrawer,
  } = useTreeForm();
  const { selectedHatId } = useHatParams();

  const d3Container = useRef(null);
  const [chart] = useState<OrgChart<unknown> | null>(new OrgChart());
  const [initialLoad, setInitialLoad] = useState<boolean>(true);
  const [chartNodes, setChartNodes] = useState<AppHat[] | undefined>(undefined);
  const { data: wearerHats } = useWearerDetails({
    wearerAddress: address,
    chainId,
    editMode,
  });
  const queryParams = new URLSearchParams(window.location.search);
  const initialCompact =
    queryParams.get('compact') === 'true' || storedConfig?.compact;
  const initialFlipped =
    queryParams.get('flipped') === 'true' || storedConfig?.flipped;
  // sorting so that the order of processing will be identical to the order of the node collapses by the user
  const collapsedNodes = queryParams
    .getAll('collapsed')
    .map((ipId) => ipToHatId(ipId))
    .sort()
    .reverse();

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
    } else if (chartNodes !== undefined && treeToDisplay !== undefined) {
      const newChartNodes = treeToDisplay;
      chartNodes.forEach((node) => {
        const newNode = newChartNodes.find((elem) => elem.id === node.id);
        if (newNode !== undefined) {
          // eslint-disable-next-line no-restricted-syntax
          for (const [key, value] of Object.entries(node)) {
            if (key.startsWith('_')) {
              newNode[key] = value;
            }
          }
        }
      });

      setChartNodes(newChartNodes);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [treeToDisplay]);

  useEffect(() => {
    if (_.isEmpty(chartNodes)) return;

    if (chartNodes && d3Container.current) {
      if (chart) {
        // TODO check for missing parents to avoid crashing
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
            if (!chainId) return;
            d3.select(this).on('click.node-update', (event: any, data: any) => {
              if (
                checkParentElementForClass(event, `click-${data.data.name}`)
              ) {
                const nextChildId = calculateNextChildId(
                  data.data.id,
                  chartNodes,
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
          .buttonContent(({ node, state }: { node: any; state: any }) => {
            const icons: { [key: string]: (d: any) => string } = {
              left: (d: any) =>
                d
                  ? `
                    <div style="display:flex;"><span style="align-items:center;display:flex;"><svg width="8" height="8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M14.283 3.50094L6.51 11.4749C6.37348 11.615 6.29707 11.8029 6.29707 11.9984C6.29707 12.194 6.37348 12.3819 6.51 12.5219L14.283 20.4989C14.3466 20.5643 14.4226 20.6162 14.5066 20.6516C14.5906 20.6871 14.6808 20.7053 14.772 20.7053C14.8632 20.7053 14.9534 20.6871 15.0374 20.6516C15.1214 20.6162 15.1974 20.5643 15.261 20.4989C15.3918 20.365 15.4651 20.1852 15.4651 19.9979C15.4651 19.8107 15.3918 19.6309 15.261 19.4969L7.9515 11.9984L15.261 4.50144C15.3914 4.36756 15.4643 4.18807 15.4643 4.00119C15.4643 3.81431 15.3914 3.63482 15.261 3.50094C15.1974 3.43563 15.1214 3.38371 15.0374 3.34827C14.9534 3.31282 14.8632 3.29456 14.772 3.29456C14.6808 3.29456 14.5906 3.31282 14.5066 3.34827C14.4226 3.38371 14.3466 3.43563 14.283 3.50094V3.50094Z" fill="#716E7B" stroke="#716E7B"/>
                      </svg></span><span style="color:#716E7B">${node.data._directSubordinatesPaging}</span>
                    </div>
                  `
                  : `
                    <div style="display:flex;"><span style="align-items:center;display:flex;"><svg width="8" height="8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M7.989 3.49944C7.85817 3.63339 7.78492 3.8132 7.78492 4.00044C7.78492 4.18768 7.85817 4.36749 7.989 4.50144L15.2985 11.9999L7.989 19.4969C7.85817 19.6309 7.78492 19.8107 7.78492 19.9979C7.78492 20.1852 7.85817 20.365 7.989 20.4989C8.05259 20.5643 8.12863 20.6162 8.21261 20.6516C8.2966 20.6871 8.38684 20.7053 8.478 20.7053C8.56916 20.7053 8.6594 20.6871 8.74338 20.6516C8.82737 20.6162 8.90341 20.5643 8.967 20.4989L16.74 12.5234C16.8765 12.3834 16.9529 12.1955 16.9529 11.9999C16.9529 11.8044 16.8765 11.6165 16.74 11.4764L8.967 3.50094C8.90341 3.43563 8.82737 3.38371 8.74338 3.34827C8.6594 3.31282 8.56916 3.29456 8.478 3.29456C8.38684 3.29456 8.2966 3.31282 8.21261 3.34827C8.12863 3.38371 8.05259 3.43563 7.989 3.50094V3.49944Z" fill="#716E7B" stroke="#716E7B"/>
                      </svg></span><span style="color:#716E7B">${node.data._directSubordinatesPaging}</span>
                    </div>
                  `,
              bottom: (d: any) =>
                d
                  ? `
                    <div style="display:flex;"><span style="align-items:center;display:flex;"><svg width="8" height="8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M19.497 7.98903L12 15.297L4.503 7.98903C4.36905 7.85819 4.18924 7.78495 4.002 7.78495C3.81476 7.78495 3.63495 7.85819 3.501 7.98903C3.43614 8.05257 3.38462 8.12842 3.34944 8.21213C3.31427 8.29584 3.29615 8.38573 3.29615 8.47653C3.29615 8.56733 3.31427 8.65721 3.34944 8.74092C3.38462 8.82463 3.43614 8.90048 3.501 8.96403L11.4765 16.74C11.6166 16.8765 11.8044 16.953 12 16.953C12.1956 16.953 12.3834 16.8765 12.5235 16.74L20.499 8.96553C20.5643 8.90193 20.6162 8.8259 20.6517 8.74191C20.6871 8.65792 20.7054 8.56769 20.7054 8.47653C20.7054 8.38537 20.6871 8.29513 20.6517 8.21114C20.6162 8.12715 20.5643 8.05112 20.499 7.98753C20.3651 7.85669 20.1852 7.78345 19.998 7.78345C19.8108 7.78345 19.6309 7.85669 19.497 7.98753V7.98903Z" fill="#716E7B" stroke="#716E7B"/>
                      </svg></span><span style="margin-left:1px;color:#716E7B">${node.data._directSubordinatesPaging}</span>
                    </div>
                  `
                  : `
                    <div style="display:flex;"><span style="align-items:center;display:flex;"><svg width="8" height="8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M11.457 8.07005L3.49199 16.4296C3.35903 16.569 3.28485 16.7543 3.28485 16.9471C3.28485 17.1398 3.35903 17.3251 3.49199 17.4646L3.50099 17.4736C3.56545 17.5414 3.64304 17.5954 3.72904 17.6324C3.81504 17.6693 3.90765 17.6883 4.00124 17.6883C4.09483 17.6883 4.18745 17.6693 4.27344 17.6324C4.35944 17.5954 4.43703 17.5414 4.50149 17.4736L12.0015 9.60155L19.4985 17.4736C19.563 17.5414 19.6405 17.5954 19.7265 17.6324C19.8125 17.6693 19.9052 17.6883 19.9987 17.6883C20.0923 17.6883 20.1849 17.6693 20.2709 17.6324C20.3569 17.5954 20.4345 17.5414 20.499 17.4736L20.508 17.4646C20.641 17.3251 20.7151 17.1398 20.7151 16.9471C20.7151 16.7543 20.641 16.569 20.508 16.4296L12.543 8.07005C12.4729 7.99653 12.3887 7.93801 12.2954 7.89801C12.202 7.85802 12.1015 7.8374 12 7.8374C11.8984 7.8374 11.798 7.85802 11.7046 7.89801C11.6113 7.93801 11.527 7.99653 11.457 8.07005Z" fill="#716E7B" stroke="#716E7B"/>
                      </svg></span><span style="margin-left:1px;color:#716E7B">${node.data._directSubordinatesPaging}</span>
                    </div>
                  `,
              right: (d: any) =>
                d
                  ? `
                    <div style="display:flex;"><span style="align-items:center;display:flex;"><svg width="8" height="8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M7.989 3.49944C7.85817 3.63339 7.78492 3.8132 7.78492 4.00044C7.78492 4.18768 7.85817 4.36749 7.989 4.50144L15.2985 11.9999L7.989 19.4969C7.85817 19.6309 7.78492 19.8107 7.78492 19.9979C7.78492 20.1852 7.85817 20.365 7.989 20.4989C8.05259 20.5643 8.12863 20.6162 8.21261 20.6516C8.2966 20.6871 8.38684 20.7053 8.478 20.7053C8.56916 20.7053 8.6594 20.6871 8.74338 20.6516C8.82737 20.6162 8.90341 20.5643 8.967 20.4989L16.74 12.5234C16.8765 12.3834 16.9529 12.1955 16.9529 11.9999C16.9529 11.8044 16.8765 11.6165 16.74 11.4764L8.967 3.50094C8.90341 3.43563 8.82737 3.38371 8.74338 3.34827C8.6594 3.31282 8.56916 3.29456 8.478 3.29456C8.38684 3.29456 8.2966 3.31282 8.21261 3.34827C8.12863 3.38371 8.05259 3.43563 7.989 3.50094V3.49944Z" fill="#716E7B" stroke="#716E7B"/>
                      </svg></span><span style="color:#716E7B">${node.data._directSubordinatesPaging}</span>
                    </div>
                  `
                  : `
                    <div style="display:flex;"><span style="align-items:center;display:flex;"><svg width="8" height="8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M14.283 3.50094L6.51 11.4749C6.37348 11.615 6.29707 11.8029 6.29707 11.9984C6.29707 12.194 6.37348 12.3819 6.51 12.5219L14.283 20.4989C14.3466 20.5643 14.4226 20.6162 14.5066 20.6516C14.5906 20.6871 14.6808 20.7053 14.772 20.7053C14.8632 20.7053 14.9534 20.6871 15.0374 20.6516C15.1214 20.6162 15.1974 20.5643 15.261 20.4989C15.3918 20.365 15.4651 20.1852 15.4651 19.9979C15.4651 19.8107 15.3918 19.6309 15.261 19.4969L7.9515 11.9984L15.261 4.50144C15.3914 4.36756 15.4643 4.18807 15.4643 4.00119C15.4643 3.81431 15.3914 3.63482 15.261 3.50094C15.1974 3.43563 15.1214 3.38371 15.0374 3.34827C14.9534 3.31282 14.8632 3.29456 14.772 3.29456C14.6808 3.29456 14.5906 3.31282 14.5066 3.34827C14.4226 3.38371 14.3466 3.43563 14.283 3.50094V3.50094Z" fill="#716E7B" stroke="#716E7B"/>
                      </svg></span><span style="color:#716E7B">${node.data._directSubordinatesPaging}</span>
                    </div>
                  `,
              top: (d: any) =>
                d
                  ? `
                    <div style="display:flex;"><span style="align-items:center;display:flex;"><svg width="8" height="8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M11.457 8.07005L3.49199 16.4296C3.35903 16.569 3.28485 16.7543 3.28485 16.9471C3.28485 17.1398 3.35903 17.3251 3.49199 17.4646L3.50099 17.4736C3.56545 17.5414 3.64304 17.5954 3.72904 17.6324C3.81504 17.6693 3.90765 17.6883 4.00124 17.6883C4.09483 17.6883 4.18745 17.6693 4.27344 17.6324C4.35944 17.5954 4.43703 17.5414 4.50149 17.4736L12.0015 9.60155L19.4985 17.4736C19.563 17.5414 19.6405 17.5954 19.7265 17.6324C19.8125 17.6693 19.9052 17.6883 19.9987 17.6883C20.0923 17.6883 20.1849 17.6693 20.2709 17.6324C20.3569 17.5954 20.4345 17.5414 20.499 17.4736L20.508 17.4646C20.641 17.3251 20.7151 17.1398 20.7151 16.9471C20.7151 16.7543 20.641 16.569 20.508 16.4296L12.543 8.07005C12.4729 7.99653 12.3887 7.93801 12.2954 7.89801C12.202 7.85802 12.1015 7.8374 12 7.8374C11.8984 7.8374 11.798 7.85802 11.7046 7.89801C11.6113 7.93801 11.527 7.99653 11.457 8.07005Z" fill="#716E7B" stroke="#716E7B"/>
                      </svg></span><span style="margin-left:1px;color:#716E7B">${node.data._directSubordinatesPaging}</span>
                    </div>
                    `
                  : `
                    <div style="display:flex;"><span style="align-items:center;display:flex;"><svg width="8" height="8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M19.497 7.98903L12 15.297L4.503 7.98903C4.36905 7.85819 4.18924 7.78495 4.002 7.78495C3.81476 7.78495 3.63495 7.85819 3.501 7.98903C3.43614 8.05257 3.38462 8.12842 3.34944 8.21213C3.31427 8.29584 3.29615 8.38573 3.29615 8.47653C3.29615 8.56733 3.31427 8.65721 3.34944 8.74092C3.38462 8.82463 3.43614 8.90048 3.501 8.96403L11.4765 16.74C11.6166 16.8765 11.8044 16.953 12 16.953C12.1956 16.953 12.3834 16.8765 12.5235 16.74L20.499 8.96553C20.5643 8.90193 20.6162 8.8259 20.6517 8.74191C20.6871 8.65792 20.7054 8.56769 20.7054 8.47653C20.7054 8.38537 20.6871 8.29513 20.6517 8.21114C20.6162 8.12715 20.5643 8.05112 20.499 7.98753C20.3651 7.85669 20.1852 7.78345 19.998 7.78345C19.8108 7.78345 19.6309 7.85669 19.497 7.98753V7.98903Z" fill="#716E7B" stroke="#716E7B"/>
                      </svg></span><span style="margin-left:1px;color:#716E7B">${node.data._directSubordinatesPaging}</span>
                    </div>
                  `,
            };
            return `<div style="border:1px solid #E4E2E9;border-radius:3px;padding:3px;font-size:9px;margin:auto auto;background-color:white"> ${icons[
              state.layout
            ](node.children)}  </div>`;
          })
          .nodeContent((d: any) => {
            const isInWearerHats = _.includes(
              _.map(wearerHats, 'id'),
              d.data.id,
            );

            const {
              imageUrl,
              name,
              details,
              detailsObject,
              isLinked,
              maxSupply,
              currentSupply,
              orgChartWearers: hatChartWearers,
              eligibility,
              toggle,
              levelAtLocalTree,
            } = d.data;

            const nextChildId = calculateNextChildId(d.data.id, chartNodes);
            const currentName = _.find(chartNodes, [
              'id',
              d.data.id,
            ])?.displayName;
            const detailsName =
              currentName || detailsObject?.data?.name || details;
            const isSelected = selectedHatId === d.id;
            const extendedEligibility = _.find(orgChartWearers, {
              id: eligibility,
            });
            const extendedToggle = _.find(orgChartWearers, {
              id: toggle,
            });

            const selectedOptionContent = () => {
              switch (selectedOption) {
                case 'wearers':
                  // handle "group" hats
                  if (_.isEqual(_.toNumber(maxSupply), 0)) {
                    return `
                      <div style="
                        margin-top: 68px;
                        width: 100%;
                        height: 40px;
                        border-top: 1px solid #4A5568;
                        padding: 10px;
                        background: rgba(196, 241, 249, 0.2);
                        display: flex;
                        flex-direction: row;
                        align-items: center;
                        justify-content: space-between;
                      ">
                        <div style="
                          display: flex;
                          flex-direction: row;
                          gap: 2px;
                        ">
                          <div style="min-width: 16px;" />
                          <div style="
                            display: -webkit-box;
                            font-size: 15px;
                            font-style: italic;
                            font-weight: 400;
                            opacity: 0.6;
                          ">
                            Group
                          </div>
                        </div>
                      </div>
                    `;
                  }
                  return `
                    <div style="
                      margin-top: 68px;
                      width: 100%;
                      height: 40px;
                      border-top: 1px solid #4A5568;
                      padding: 10px;
                      background: ${hatChartWearers?.color};
                      display: flex;
                      flex-direction: row;
                      align-items: center;
                      justify-content: space-between;
                    ">
                      <div style="
                        display: flex;
                        flex-direction: row;
                        gap: 2px;
                      ">
                        <div style="min-width: 16px;">
                          ${hatChartWearers?.icon || ''}
                        </div>
                        <div style="
                          display: -webkit-box;
                          font-size: 15px;
                          font-weight: ${currentSupply > 0 ? 'bold' : 'medium'};
                          opacity: 0.8;
                          overflow: hidden;
                          width: ${hatChartWearers?.contentWidth};
                          -webkit-line-clamp: 1;
                          -webkit-box-orient: vertical;
                        ">
                          ${hatChartWearers?.content}
                        </div>
                      </div>
                      ${
                        hatChartWearers?.accent
                          ? `<div style="
                              display: inline-block;
                              fit-content: contain;
                              text-align: right;
                              min-width: ${hatChartWearers?.accentWidth};
                              opacity: 0.6;
                            ">
                              ${hatChartWearers?.accent}
                            </div>`
                          : ''
                      }
                    </div>`;
                case 'permissions':
                  return `
                    <div style="
                    margin-top: 68px;
                    width: 100%;
                    height: 40px;
                    border-top: 1px solid #4A5568;
                    padding: 10px;
                    display: flex;
                    flex-direction: row;
                    align-items: center;
                    justify-content: space-between;
                  ">
                    <div style="
                      display: flex;
                      flex-direction: row;
                      gap: 4px;
                    ">
                      Test
                    </div>
                  </div>`;
                case 'authorities':
                  return ``;

                case 'toggle':
                  return `
                    <div style="
                      margin-top: 68px;
                      width: 100%;
                      height: 40px;
                      border-top: 1px solid #4A5568;
                      padding: 10px;
                      display: flex;
                      flex-direction: row;
                      align-items: center;
                      justify-content: space-between;
                    ">
                      <div style="
                        display: flex;
                        flex-direction: row;
                        gap: 4px;
                      ">
                        <div style="min-width: 16px;">
                          <img src="/icons/toggle.svg" alt="toggle" />
                        </div>
                        <div style="
                          display: inline-block;
                          font-size: 15px;
                          font-weight: 550;
                          opacity: 0.8;
                        ">
                          ${
                            // eslint-disable-next-line no-nested-ternary
                            levelAtLocalTree === 0
                              ? 'None - Top Hat'
                              : extendedToggle?.ensName &&
                                extendedToggle?.ensName !== ''
                              ? extendedToggle?.ensName
                              : formatAddress(toggle)
                          }
                        </div>
                      </div>
                    </div>`;

                case 'eligibility':
                  return `
                    <div style="
                      margin-top: 68px;
                      width: 100%;
                      height: 40px;
                      border-top: 1px solid #4A5568;
                      padding: 10px;
                      display: flex;
                      flex-direction: row;
                      align-items: center;
                      justify-content: space-between;
                    ">
                      <div style="
                        display: flex;
                        flex-direction: row;
                        gap: 4px;
                      ">
                        <div style="min-width: 16px;">
                          <img src="/icons/eligibility.svg" alt="toggle" />
                        </div>
                        <div style="
                          display: inline-block;
                          font-size: 15px;
                          font-weight: 550;
                          opacity: 0.8;
                        ">
                          ${
                            // eslint-disable-next-line no-nested-ternary
                            levelAtLocalTree === 0
                              ? 'None - Top Hat'
                              : extendedEligibility?.ensName &&
                                extendedEligibility?.ensName !== ''
                              ? extendedEligibility?.ensName
                              : formatAddress(eligibility)
                          }
                        </div>
                      </div>
                    </div>
                  `;

                default:
                  return '';
              }
            };

            return `
            <div style='
              width: ${d.width}px;
              height: ${d.height}px;
              padding-left: 1px;
              padding-right: 1px;'
            >
              <div style="
                display: flex;
                flex-direction: column;
                align-items: center;
                background-color: white;
                border: 
                  ${isSelected ? '2px' : '1px'} 
                  ${isLinked ? 'dotted' : 'solid'} #4A5568;
                border-radius: 4px;
                width: ${d.width}px;
                height: ${d.height}px;
                overflow: hidden;
                box-shadow: ${
                  isSelected
                    ? '0px 25px 50px -12px rgba(0, 0, 0, 0.25)'
                    : '0px 2px 4px -1px rgba(0, 0, 0, 0.06), 0px 4px 6px -1px rgba(0, 0, 0, 0.10)'
                };
                "
              >
                <div style="
                  width: 100%;
                  display: flex;
                  align-items: center;
                  position: relative;
                ">
                  <div style="
                    position: fixed;
                    width: ${isSelected ? '78.5px' : '70px'};
                    height: ${isSelected ? '78.5px' : '70px'};
                    border: 
                      ${isSelected ? '2px' : '1px'} 
                      ${isLinked ? 'dotted' : 'solid'} #4A5568;
                    left: ${isSelected ? -4 : 1}px;
                    top: ${isSelected ? -4 : 0}px;
                    border-radius: 4px;
                    overflow: hidden;
                    ${isSelected && 'background: white;'}
                  ">
                    <img
                      loading="lazy"
                      src="${
                        imageUrl && imageUrl !== '' && imageUrl !== null
                          ? imageUrl
                          : '/icon.jpeg'
                      }"
                      style="
                        background: white;
                        height: 100%;
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
                          color: #08011E;"
                        >
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
                        overflow: hidden;
                        color: #08011E;
                        font-weight: 500;
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
                  selectedOption !== 'title' && !editMode
                    ? selectedOptionContent()
                    : ''
                }
                ${
                  editMode
                    ? `<div style="
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
                      position: relative;
                    " class="hover-text">
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
                        Create Hat ${nextChildId}
                      </div>
                      <div style="
                        display: block;
                        background: white;
                        border-radius: 2px;
                        height: 14px;
                        width: 14px;
                      ">
                        <img src="/icons/plus-square.svg" alt="add" style="height: 100%;" />
                      </div>
                    </div>
                  </div>`
                    : ''
                }
              </div>
            </div>`;
          })
          .compact(compact)
          .layout(flipped ? 'bottom' : 'top')
          .onExpandOrCollapse((d: any) => {
            if (handleNodeCollapsedOrExpanded !== undefined && !editMode) {
              const isExpanded = d.children !== null;
              handleNodeCollapsedOrExpanded(idToIp(d.data.id), isExpanded);

              if (isExpanded) {
                d.data._collapsed = false;
                adjustAfterNodeExpanded(d);
              } else {
                d.data._collapsed = true;
              }
            }
          });

        if (editMode) {
          chart.expandAll(); // keep nodes expanded on edit mode. Note that expandAll performs a render so no need to call render again
        } else {
          chart.render();
        }

        if (!initialLoad) return;

        // encode the collapsed nodes in the tree to display, used for custom manipulation of expanded/collapsed nodes
        collapsedNodes.forEach((node) => {
          const hatToUpdate = chartNodes.find((hat) => {
            if (hat.id === node) {
              return true;
            }
            return false;
          });
          (hatToUpdate as any)._collapsed = true;
        });

        if (!editMode) {
          recreateNodesCollapse(chart, collapsedNodes);
        }

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

        setInitialLoad(false);
      }
    }
  }, [
    chart,
    chainId,
    onOpenHatDrawer,
    onCloseTreeDrawer,
    selectedHatId,
    storedData,
    wearerHats,
    showInactiveHats,
    selectedOption,
    initialLoad,
    editMode,
    toast,
    addHat,
    setStoredData,
    userChain,
    chartNodes,
    compact,
    flipped,
    orgChartWearers,
    collapsedNodes,
    handleNodeCollapsedOrExpanded,
  ]);

  return isLoading ? (
    <Flex
      h='calc(100% - 200px)'
      w='100%'
      alignItems='center'
      justifyContent='center'
    >
      <Spinner />
    </Flex>
  ) : (
    <Box position='relative' pt='145px' h='calc(100% + 5px)'>
      <div
        style={{
          overflow: 'hidden',
          height: '100%',
        }}
        ref={d3Container}
        id='d3Container'
      />
      <HStack position='absolute' bottom={4} left={4}>
        <Button
          variant='outline'
          bg={editMode ? '#C4F1F9' : 'whiteAlpha.800'}
          onClick={() => {
            chart?.expandAll();
            chart?.fit();
          }}
        >
          Show full {CONFIG.tree}
        </Button>
        <Button
          onClick={() => {
            toggleCompact();
            handleSetCompact?.(!compact);
          }}
          variant='outline'
          bg={editMode ? '#C4F1F9' : 'whiteAlpha.800'}
        >
          {compact ? 'Full View' : 'Compact View'}
        </Button>
        <Button
          onClick={() => {
            toggleFlip();
            handleFlipChart?.(!flipped);
            setTimeout(() => {
              chart?.fit();
            }, 50);
          }}
          variant='outline'
          bg={editMode ? '#C4F1F9' : 'whiteAlpha.800'}
        >
          Flip Tree
        </Button>
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
};

const centerChart = (chart: any, nodeId: string) => {
  const currentState = chart?.getChartState();
  currentState.lastTransform.k = 1;

  if (!currentState) {
    chart.setCentered(nodeId);
    return;
  }

  const nodeData = currentState.allNodes.find(
    (n: { id: string }) => n.id === nodeId,
  ) as any;

  if (!nodeData) {
    chart.setCentered(nodeId);
    return;
  }

  const nodeX = nodeData.x;
  const nodeY = nodeData.y;

  const svgWidth = chart.svgWidth();
  const svgHeight = chart.svgHeight();

  const targetX = svgWidth * 0.9;
  const targetY = svgHeight * 0.6;

  const zoomTreeBounds = {
    x0: nodeX - targetX / 2,
    y0: nodeY - targetY / 2,
    x1: nodeX + targetX,
    y1: nodeY + targetY,
    params: {
      animate: true,
    },
  };

  chart?.zoomTreeBounds(zoomTreeBounds);
};

const recreateNodesCollapse = (
  chart: OrgChart<unknown>,
  collpasedNodes: string[],
) => {
  const { allNodes } = chart.getChartState();

  if (allNodes === undefined) {
    return;
  }

  // first init all nodes as expanded
  for (let i = 0; i < allNodes.length; i += 1) {
    (allNodes[i].data as any)._expanded = true;
  }

  // collapse initially collapsed nodes
  collpasedNodes.forEach((collapsedNode) => {
    const nodeToCollapse = allNodes.find((node: any) => {
      if (node.data.id === collapsedNode) {
        return true;
      }
      return false;
    });

    if (nodeToCollapse !== undefined) {
      collpaseNode(chart, nodeToCollapse);
    }
  });
};

const collpaseNode = (chart: OrgChart<unknown>, node: any) => {
  // If children are expanded
  if (node.children) {
    node._children = node.children;
    node.children = null;

    // Set descendants expanded property to false
    chart.setExpansionFlagToChildren(node, false);
    chart.update(node);
  } else {
    // Set descendants expanded property to false
    chart.setExpansionFlagToChildren(node, false);
    chart.update(node);
  }
};

const adjustAfterNodeExpanded = ({ data, children, _children }) => {
  // if node is collapsed by the user, don't expand it and its descendants
  if (data._collapsed) return;

  data._expanded = true;

  // Loop over and recursively update expanded children's descendants
  if (children) {
    children.forEach((d) => {
      adjustAfterNodeExpanded(d);
    });
  }

  // Loop over and recursively update collapsed children's descendants
  if (_children) {
    _children.forEach((d) => {
      adjustAfterNodeExpanded(d);
    });
  }
};

export default OrgChartComponent;
