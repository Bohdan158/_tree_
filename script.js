class BTreeNode {
  constructor(isLeaf = true) {
    this.keys = [];
    this.children = [];
    this.isLeaf = isLeaf;
  }
}

class BTree {
  constructor(t) {
    this.t = t; // Order of the tree
    this.root = new BTreeNode();
  }

  addKey(key) {
    if (this.root.keys.length === 2 * this.t - 1) {
      let newRoot = new BTreeNode(false);
      newRoot.children.push(this.root);
      this.splitChild(newRoot, 0);
      this.root = newRoot;
    }
    this.insertNonFull(this.root, key);
  }

  insertNonFull(node, key) {
    let i = node.keys.length - 1;
    if (node.isLeaf) {
      while (i >= 0 && key < node.keys[i]) {
        i--;
      }
      node.keys.splice(i + 1, 0, key);
    } else {
      while (i >= 0 && key < node.keys[i]) {
        i--;
      }
      i++;
      if (node.children[i].keys.length === 2 * this.t - 1) {
        this.splitChild(node, i);
        if (key > node.keys[i]) i++;
      }
      this.insertNonFull(node.children[i], key);
    }
  }

  splitChild(parent, index) {
    let child = parent.children[index];
    let newNode = new BTreeNode(child.isLeaf);

    newNode.keys = child.keys.splice(this.t);
    parent.keys.splice(index, 0, child.keys.pop());

    if (!child.isLeaf) {
      newNode.children = child.children.splice(this.t);
    }
    parent.children.splice(index + 1, 0, newNode);
  }

  searchKey(node, key) {
    let i = 0;
    while (i < node.keys.length && key > node.keys[i]) {
      i++;
    }

    if (i < node.keys.length && key === node.keys[i]) {
      return true; // Key found
    }

    if (node.isLeaf) {
      return false; // Key not found
    }

    return this.searchKey(node.children[i], key);
  }

  deleteKey(key) {
    this._deleteKey(this.root, key);
    if (this.root.keys.length === 0 && !this.root.isLeaf) {
      this.root = this.root.children[0];
    }
    this.display();
  }

  _deleteKey(node, key) {
    let i = 0;
    while (i < node.keys.length && key > node.keys[i]) {
      i++;
    }

    if (i < node.keys.length && key === node.keys[i]) {
      if (node.isLeaf) {
        node.keys.splice(i, 1);
      } else {
        this._deleteInternalNode(node, i);
      }
    } else {
      if (node.isLeaf) {
        return; // Key not found
      }

      let child = node.children[i];
      if (child.keys.length < this.t) {
        this._fillChild(node, i);
        child = node.children[i];
      }

      if (child.isLeaf) {
        this._deleteKey(child, key);
      } else {
        this._deleteInternalNode(child, i);
      }
    }
  }

  _deleteInternalNode(node, index) {
    let key = node.keys[index];
    let leftChild = node.children[index];
    let rightChild = node.children[index + 1];

    if (leftChild.keys.length >= this.t) {
      let predKey = this._getPredecessor(leftChild);
      node.keys[index] = predKey;
      this._deleteKey(leftChild, predKey);
    } else if (rightChild.keys.length >= this.t) {
      let succKey = this._getSuccessor(rightChild);
      node.keys[index] = succKey;
      this._deleteKey(rightChild, succKey);
    } else {
      this._mergeChildren(node, index);
      this._deleteKey(leftChild, key);
    }
  }

  _getPredecessor(node) {
    while (!node.isLeaf) {
      node = node.children[node.children.length - 1];
    }
    return node.keys[node.keys.length - 1];
  }

  _getSuccessor(node) {
    while (!node.isLeaf) {
      node = node.children[0];
    }
    return node.keys[0];
  }

  _mergeChildren(node, index) {
    let leftChild = node.children[index];
    let rightChild = node.children[index + 1];
    leftChild.keys.push(node.keys[index]);
    leftChild.keys = leftChild.keys.concat(rightChild.keys);
    leftChild.children = leftChild.children.concat(rightChild.children);

    node.keys.splice(index, 1);
    node.children.splice(index + 1, 1);
  }

  _fillChild(node, index) {
    let child = node.children[index];
    let prevChild = index > 0 ? node.children[index - 1] : null;
    let nextChild = index < node.children.length - 1 ? node.children[index + 1] : null;

    if (prevChild && prevChild.keys.length >= this.t) {
      this._borrowFromPrev(node, index);
    } else if (nextChild && nextChild.keys.length >= this.t) {
      this._borrowFromNext(node, index);
    } else {
      if (prevChild) {
        this._mergeChildren(node, index - 1);
      } else {
        this._mergeChildren(node, index);
      }
    }
  }

  _borrowFromPrev(node, index) {
    let child = node.children[index];
    let sibling = node.children[index - 1];

    child.keys.unshift(node.keys[index - 1]);
    node.keys[index - 1] = sibling.keys.pop();

    if (!child.isLeaf) {
      child.children.unshift(sibling.children.pop());
    }
  }

  _borrowFromNext(node, index) {
    let child = node.children[index];
    let sibling = node.children[index + 1];

    child.keys.push(node.keys[index]);
    node.keys[index] = sibling.keys.shift();

    if (!child.isLeaf) {
      child.children.push(sibling.children.shift());
    }
  }

  display(node = this.root, container = document.getElementById('treeContainer')) {
    container.innerHTML = '';
    const renderNode = (node) => {
      let div = document.createElement('div');
      div.className = 'node';
      div.innerText = node.keys.join(', ');
      return div;
    };

    const traverse = (node, parentElement) => {
      let nodeElement = renderNode(node);
      parentElement.appendChild(nodeElement);

      if (!node.isLeaf) {
        let childrenContainer = document.createElement('div');
        childrenContainer.style.display = 'flex';
        childrenContainer.style.justifyContent = 'center';
        parentElement.appendChild(childrenContainer);

        node.children.forEach((child) => {
          traverse(child, childrenContainer);
        });
      }
    };

    traverse(node, container);
  }
}

// Initialize B-Tree
const bTree = new BTree(10);

function addKey() {
  const keyInput = document.getElementById('keyInput');
  const key = parseInt(keyInput.value, 10);
  if (!isNaN(key)) {
    bTree.addKey(key);
    bTree.display();
    keyInput.value = '';
  } else {
    alert('Please enter a valid number');
  }
}

function generateRandomKeys() {
  const randomKey1 = Math.floor(Math.random() * 1000); 
  const randomKey2 = Math.floor(Math.random() * 1000); 
  bTree.addKey(randomKey1);
  bTree.addKey(randomKey2);
  bTree.display();
  alert(`Generated and added random keys: ${randomKey1}, ${randomKey2}`);
}

function searchKey() {
  const keyInput = document.getElementById('keyInput');
  const key = parseInt(keyInput.value, 10);
  if (!isNaN(key)) {
    const found = bTree.searchKey(bTree.root, key);
    if (found) {
      alert(`Key ${key} found in the tree!`);
    } else {
      alert(`Key ${key} not found.`);
    }
  } else {
    alert('Please enter a valid number');
  }
}

function deleteKey() {
  const keyInput = document.getElementById('keyInput');
  const key = parseInt(keyInput.value, 10);
  if (!isNaN(key)) {
    bTree.deleteKey(key);
    alert(`Key ${key} deleted.`);
  } else {
    alert('Please enter a valid number');
  }
}

bTree.display();
