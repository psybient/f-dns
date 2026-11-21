const treeSelectUtils = {
  hierarchyTreeDomHandler: async (container, node) => {
    const nodeLevel = node.dataset.leafLevel;

    if (nodeLevel === "0") {
      const childNodes = container.querySelectorAll(
        `input[data-parent-unit-id="${node.dataset.nodeId}"]`
      );

      const innerChildNodes = new Map();
      childNodes.forEach((childNode) => {
        let innerNodesContainer = container.querySelector(
          `ul[data-unit-id="${childNode.dataset.nodeId}"]`
        );

        innerChildNodes.set(
          childNode.dataset.nodeId,
          innerNodesContainer.querySelectorAll("input")
        );
      });

      childNodes.forEach((checkBox) => {
        checkBox.checked = node.checked;
      });

      for (let [key, value] of innerChildNodes) {
        if (value && value.length > 0) {
          value.forEach((box) => (box.checked = node.checked));
        }
      }
    } else if (nodeLevel === "8") {
      const rootNode = container.querySelector(
        `input[data-node-id="${node.dataset.parentUnitId}"]`
      );
      const middleBranch = container.querySelectorAll(
        `input[data-parent-unit-id="${rootNode.dataset.nodeId}"]`
      );
      let doesRootHaveOtherSelectedLeaf =
        [...middleBranch].filter((checkbox) => checkbox.checked).length > 0
          ? true
          : false;

      const childNodes = container.querySelectorAll(
        `input[data-parent-unit-id="${node.dataset.nodeId}"]`
      );

      if (node.checked == false) {
        if (doesRootHaveOtherSelectedLeaf == false) {
          rootNode.checked = false;
        } else rootNode.checked = true;
      } else {
        rootNode.checked = true;
        node.checked = true;
      }

      childNodes.forEach((checkBox) => {
        checkBox.checked = node.checked;
      });
    } else if (nodeLevel === "9") {
      const childNodes = container.querySelectorAll(
        `input[data-parent-unit-id="${node.dataset.nodeId}"]`
      );

      const innerChildNodes = new Map();
      childNodes.forEach((childNode) => {
        let innerNodesContainer = container.querySelector(
          `ul[data-unit-id="${childNode.dataset.nodeId}"]`
        );

        innerChildNodes.set(
          childNode.dataset.nodeId,
          innerNodesContainer.querySelectorAll("input")
        );
      });

      childNodes.forEach((checkBox) => {
        checkBox.checked = node.checked;
      });

      for (let [key, value] of innerChildNodes) {
        if (value && value.length > 0) {
          console.log(node.checked, "inside root");
          value.forEach((box) => (box.checked = node.checked));
        }
      }

      const parentNode = container.querySelector(
        `input[data-node-id="${node.dataset.parentUnitId}"]`
      );
      const rootNode = container.querySelector(
        `input[data-node-id="${parentNode.dataset.parentUnitId}"]`
      );
      // const sameBranch = container.querySelectorAll(`input[data-parent-unit-id="${node.parentUnitId}"]`)
      const middleBranch = container.querySelectorAll(
        `input[data-parent-unit-id="${rootNode.dataset.nodeId}"]`
      );
      const sameBranch = container.querySelectorAll(
        `input[data-parent-unit-id="${node.dataset.parentUnitId}"]`
      );
      // console.log({
      //   sameBranch: sameBranch,
      //   root: rootNode,
      //   middleBranch: middleBranch,
      // });
      // console.log({ isNodeChecked: node.checked });

      if (node.checked === false) {
        let doesBrancheHaveOtherSelectedLeaf =
          [...sameBranch].filter((checkbox) => checkbox.checked).length > 0
            ? true
            : false;

        let MiddleBranchOtherSelectedNodes = [...middleBranch].filter(
          (checkbox) => {
            if (
              checkbox.checked === true &&
              checkbox.dataset.nodeId !== parentNode.dataset.nodeId
            )
              return checkbox;
          }
        );

        // parentNode.checked = false;
        let doesRootHaveOtherSelectedLeaf =
          MiddleBranchOtherSelectedNodes.length > 0 ? true : false;

        if (doesBrancheHaveOtherSelectedLeaf === false) {
          parentNode.checked = false;
          if (doesRootHaveOtherSelectedLeaf === false) rootNode.checked = false;
        }
      } else {
        parentNode.checked = true;
        rootNode.checked = true;
      }
    }
  },

  treeDomHandler: (container, node) => {
    var ifAllChecked = 0;
    const nodeType = node.dataset.nodeType;
    const parentNode =
      nodeType === "root"
        ? node
        : container.querySelectorAll(
            `input[data-node-id="${node.dataset.parentUnitId}"]`
          )[0];
    const childNodes = container.querySelectorAll(
      `input[data-parent-unit-id="${
        nodeType === "root" ? node.dataset.nodeId : node.dataset.parentUnitId
      }"]`
    );

    if (node.dataset.nodeType === "root") {
      node.classList.remove("half-checked");
      node.checked === true
        ? childNodes.forEach((checkBox) => (checkBox.checked = true))
        : childNodes.forEach((checkBox) => (checkBox.checked = false));
    } else {
      childNodes.forEach((checkBox) =>
        checkBox.checked ? ifAllChecked++ : null
      );
      childNodes.length === ifAllChecked
        ? (parentNode.checked = true)
        : (parentNode.checked = false);
      childNodes.length === ifAllChecked || ifAllChecked === 0
        ? parentNode.classList.remove("half-checked")
        : parentNode.classList.add("half-checked");
    }
  },
};

export default treeSelectUtils;
