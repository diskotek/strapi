import { fromJS } from 'immutable';

const initialState = fromJS({
  collapses: {},
  groupLayoutsData: {},
  initialData: {},
  isLoading: true,
  isLoadingForLayouts: true,
  modifiedData: {},
  defaultGroupValues: {},
});

const getMax = arr => {
  if (arr.size === 0) {
    return -1;
  }
  return Math.max.apply(Math, arr.toJS().map(o => o._temp__id));
};

function reducer(state, action) {
  switch (action.type) {
    case 'ADD_FIELD_TO_GROUP':
      return state.updateIn(['modifiedData', ...action.keys], list => {
        const defaultAttribute = state.getIn([
          'defaultGroupValues',
          ...action.keys,
          'defaultRepeatable',
        ]);

        if (list) {
          const max = getMax(list);

          return list.push(
            fromJS(
              defaultAttribute
                ? defaultAttribute.set('_temp__id', max + 1)
                : { _temp__id: max + 1 }
            )
          );
        }
        return fromJS([
          defaultAttribute
            ? defaultAttribute.set('_temp__id', 0)
            : { _temp__id: 0 },
        ]);
      });
    case 'GET_DATA_SUCCEEDED':
      return state
        .update('initialData', () => fromJS(action.data))
        .update('modifiedData', () => fromJS(action.data))
        .update('isLoading', () => false);
    case 'GET_GROUP_LAYOUTS_SUCCEEDED':
      return state
        .update('groupLayoutsData', () => fromJS(action.groupLayouts))
        .update('defaultGroupValues', () => fromJS(action.defaultGroupValues))
        .update('modifiedData', obj => {
          if (action.isCreatingEntry === true) {
            const { defaultGroupValues } = action;

            return obj.keySeq().reduce((acc, current) => {
              if (defaultGroupValues[current]) {
                return acc.set(
                  current,
                  fromJS(defaultGroupValues[current].toSet)
                );
              }
              return acc;
            }, obj);
          }

          return obj;
        })
        .update('isLoadingForLayouts', () => false);
    case 'MOVE_GROUP_FIELD':
      return state.updateIn(['modifiedData', ...action.keys], list => {
        return list
          .delete(action.dragIndex)
          .insert(action.overIndex, list.get(action.dragIndex));
      });
    case 'ON_CHANGE':
      return state.updateIn(
        ['modifiedData', ...action.keys],
        () => action.value
      );
    case 'ON_REMOVE_FIELD':
      return state
        .removeIn(['modifiedData', ...action.keys])
        .updateIn(['modifiedData', action.keys[0]], list => {
          if (action.shouldAddEmptyField) {
            const defaultAttribute = state.getIn([
              'defaultGroupValues',
              action.keys[0],
              'defaultRepeatable',
            ]);
            const max = getMax(list);

            return list.push(defaultAttribute.set('_temp__id', max + 1));
          }

          return list;
        });
    case 'RESET_FORM':
      return state.update('modifiedData', () => state.get('initialData'));
    case 'SET_COLLAPSES_COMPONENTS_STATE':
      return state.update('collapses', () => fromJS(action.collapses));
    default:
      return state;
  }
}

export default reducer;
export { initialState };