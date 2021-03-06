import {
  getEnterLeaveForKind,
  getVisitFn,
  visitInParallel,
  BREAK,
} from 'graphql/language/visitor';

export { getEnterLeaveForKind, getVisitFn, visitInParallel, BREAK };

export function visit(node, visitor) {
  const path = [];
  const ancestors = [];

  function traverse(node, key, parent) {
    let hasEdited = false;

    const enter = getVisitFn(visitor, node.kind, false);
    const resultEnter =
      enter && enter.call(visitor, node, key, parent, path, ancestors);
    if (resultEnter === false) {
      return node;
    } else if (resultEnter === null) {
      return null;
    } else if (resultEnter === BREAK) {
      throw BREAK;
    } else if (resultEnter && typeof resultEnter.kind === 'string') {
      hasEdited = resultEnter !== node;
      node = resultEnter;
    }

    if (parent) ancestors.push(parent);

    let result;
    const copy = { ...node };
    for (const nodeKey in node) {
      path.push(nodeKey);
      let value = node[nodeKey];
      if (Array.isArray(value)) {
        const newValue = [];
        for (let index = 0; index < value.length; index++) {
          if (value[index] != null && typeof value[index].kind === 'string') {
            ancestors.push(node);
            path.push(index);
            result = traverse(value[index], index, value);
            path.pop();
            ancestors.pop();
            if (result === undefined) {
              newValue.push(value[index]);
            } else if (result === null) {
              hasEdited = true;
            } else {
              hasEdited = hasEdited || result !== value[index];
              newValue.push(result);
            }
          }
        }
        value = newValue;
      } else if (value != null && typeof value.kind === 'string') {
        result = traverse(value, nodeKey, node);
        if (result !== undefined) {
          hasEdited = hasEdited || value !== result;
          value = result;
        }
      }

      path.pop();
      if (hasEdited) copy[nodeKey] = value;
    }

    if (parent) ancestors.pop();
    const leave = getVisitFn(visitor, node.kind, true);
    const resultLeave =
      leave && leave.call(visitor, node, key, parent, path, ancestors);
    if (resultLeave === BREAK) {
      throw BREAK;
    } else if (resultLeave !== undefined) {
      return resultLeave;
    } else if (resultEnter !== undefined) {
      return hasEdited ? copy : resultEnter;
    } else {
      return hasEdited ? copy : node;
    }
  }

  try {
    const result = traverse(node);
    return result !== undefined && result !== false ? result : node;
  } catch (error) {
    if (error !== BREAK) throw error;
    return node;
  }
}
