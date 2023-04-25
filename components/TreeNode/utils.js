import styles from './TreeNode.module.css';

export const styleEdgeFunc = ({ source, target }) => {
  if (target.data.attributes.linked || source.data.attributes.linked) {
    return styles.dashIt;
  }
};
