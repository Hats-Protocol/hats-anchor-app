import { OrgChart } from 'd3-org-chart';
import { includes, split } from 'lodash';

export function checkParentElementForClass(e: any, name: string) {
  let element = e.srcElement;
  let n = 0;
  while (element) {
    if (n > 5) break;
    const classArray = split(element.classList.value, ' ');
    if (classArray && includes(classArray, name)) {
      return true;
    }
    element = element.parentNode;
    n += 1;
  }
  return false;
}

export const centerChart = (chart: any, nodeId: string) => {
  const currentState = chart?.getChartState();
  currentState.lastTransform.k = 1;

  if (!currentState) {
    chart.setCentered(nodeId);
    return;
  }

  const nodeData = currentState.allNodes.find((n: { id: string }) => n.id === nodeId) as any;

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

export const recreateNodesCollapse = (chart: OrgChart<unknown>, collapsedNodes: string[]) => {
  const { allNodes } = chart.getChartState();

  // first init all nodes as expanded
  for (let i = 0; i < allNodes.length; i += 1) {
    (allNodes[i].data as any)._expanded = true;
  }

  // collapse initially collapsed nodes
  collapsedNodes.forEach((collapsedNode) => {
    const nodeToCollapse = allNodes.find((node: any) => {
      if (node.data.id === collapsedNode) {
        return true;
      }
      return false;
    });

    if (nodeToCollapse !== undefined) {
      collapseNode(chart, nodeToCollapse);
    }
  });
};

const collapseNode = (chart: OrgChart<unknown>, node: any) => {
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

export const adjustAfterNodeExpanded = ({ data, children, _children }: any) => {
  // if node is collapsed by the user, don't expand it and its descendants
  if (data._collapsed) return;

  // eslint-disable-next-line no-param-reassign
  data._expanded = true;

  // Loop over and recursively update expanded children's descendants
  if (children) {
    children.forEach((d: any) => {
      adjustAfterNodeExpanded(d);
    });
  }

  // Loop over and recursively update collapsed children's descendants
  if (_children) {
    _children.forEach((d: any) => {
      adjustAfterNodeExpanded(d);
    });
  }
};
