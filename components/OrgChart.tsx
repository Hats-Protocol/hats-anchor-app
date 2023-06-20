import React, { useLayoutEffect, useRef, useState } from 'react';
import { OrgChart } from 'd3-org-chart';
import {
  Flex,
  Spinner,
  Button,
  Box,
  IconButton,
  HStack,
  Icon,
} from '@chakra-ui/react';
import { FaMinus, FaPlus } from 'react-icons/fa';

export interface HatData {
  id: string;
  name: string;
  parentId: string | null;
  imageURI: string;
  treeId: string;
  isLinked: boolean;
  url: string;
  details?: string;
  active: boolean;
}

interface OrgChartComponentProps {
  tree: HatData[] | null;
  isLoading: boolean;
  chainId: number;
  wearerHats: string[];
  onSelectHat: (node: string) => void;
  selectedHat: string | null;
  selectedOption?: string;
  showInactiveHats: boolean;
}

const OrgChartComponent: React.FC<OrgChartComponentProps> = ({
  tree,
  isLoading,
  chainId,
  wearerHats,
  onSelectHat,
  selectedHat,
  selectedOption,
  showInactiveHats,
}) => {
  console.log('selectedOption', selectedOption);
  const d3Container = useRef(null);
  const [chart] = useState<OrgChart<unknown> | null>(new OrgChart());

  useLayoutEffect(() => {
    const filteredTree = tree?.filter((t) => (showInactiveHats ? t : t.active));

    if (filteredTree && d3Container.current) {
      if (chart) {
        chart
          .container(d3Container.current)
          .data(filteredTree ?? [])
          // set dims of the chart window
          .svgHeight(window.innerHeight - 150)
          .svgWidth(window.innerWidth)
          // margin from top for root node
          .rootMargin(80)
          // set active node centered when clicking expand/collapse
          .setActiveNodeCentered(true)
          // set node sizes
          .nodeHeight(() => 70)
          .nodeWidth(() => 220)
          // node click handler
          .onNodeClick((node: any) => {
            onSelectHat(node);
            chart.setCentered(node);
          })
          .nodeContent((d: any) => {
            // State to keep track of selected node

            const isInWearerHats = wearerHats.includes(d.data.id);
            // Placeholder for your icon. Replace it with actual URL.
            const { imageURI, name, details, isLinked } = d.data;
            const hasChildren = filteredTree.filter(
              (t) => t.parentId === d.id,
            ).length;
            console.log('hasChildren', hasChildren);

            const detailsName =
              // eslint-disable-next-line no-nested-ternary
              details?.type === '1.0'
                ? details?.data?.name
                : typeof details === 'string'
                ? details
                : '';

            const isSelected = selectedHat === d.id;

            return `
            <div style='
              width: ${d.width}px;
              height: ${d.height}px;
              padding-left: 1px;
              padding-right: 1px;'
            >
              <div style="
                display: flex;
                align-items: center;
                background-color: white;
                border: 
                  ${isSelected ? '2px' : '1px'} 
                  ${isLinked ? 'dotted' : 'solid'} #4A5568;
                border-radius: 4px;
                width: ${d.width}px;
                height: 70px;"
              >
                  <img
                    src="${imageURI ?? '/icon.jpeg'}"
                    style="
                      background: white;
                      width: ${isSelected ? '78.5px' : '70px'};
                      height: ${isSelected ? '78.5px' : '70px'};
                      border: 
                        ${isSelected ? '2px' : '1px'} 
                        ${isLinked ? 'dotted' : 'solid'} #4A5568;
                      border-radius: 4px;
                      margin-left: ${isSelected ? -2 : -1}px;"
                  />
                  <div style="
                    display: flex;
                    flex-direction: column;
                    height: 100%;
                    width: 100%;
                    position: relative;"
                  >
                      <div style="
                        display: flex;
                        flex-direction: column;
                        position: absolute;
                        left: ${isSelected ? 8 : 10}px;
                        top: ${isSelected ? 9 : 10}px;"
                      >
                          ${
                            selectedOption === 'titleOnly' && detailsName !== ''
                              ? ''
                              : `<div style="
                                  font-size: 12px;
                                  color: ${isSelected ? '#248559' : '#08011E'};"
                                >
                                  ${name}
                                </div>`
                          }
                          <div style="
                            font-size: 16px;
                            color: #08011E;
                            font-weight: 500;
                            overflow: hidden;
                            max-width: 105px;
                            max-height: 40px;"
                          >
                            ${detailsName}
                          </div>
                      </div>
                  </div>
                  ${
                    isInWearerHats
                      ? `<img src='/wearer.svg'
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
            </div>`;
          })
          .render();
      }
    }
  }, [
    chart,
    tree,
    isLoading,
    chainId,
    onSelectHat,
    selectedHat,
    wearerHats,
    showInactiveHats,
    selectedOption,
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
    <Box position='relative' pt='150px'>
      <div
        style={{
          overflow: 'hidden',
          zIndex: 0,
          // background: 'blue',
        }}
        ref={d3Container}
        id='d3Container'
      />
      <Button
        variant='outline'
        position='absolute'
        bottom={4}
        left={4}
        onClick={() => chart?.fit()}
      >
        Show full structure
      </Button>

      <HStack position='absolute' bottom={4} right={4}>
        <IconButton
          icon={<Icon as={FaMinus} />}
          variant='outline'
          aria-label='zoom out'
          onClick={() => chart?.zoomOut()}
        />
        <IconButton
          icon={<Icon as={FaPlus} />}
          variant='outline'
          aria-label='zoom in'
          onClick={() => chart?.zoomIn()}
        />
      </HStack>
    </Box>
  );
};

export default OrgChartComponent;
