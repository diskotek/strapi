import { fromJS } from 'immutable';

const initialState = fromJS({
  initialData: {},
  isLoading: true,
  modifiedData: {},
});

function reducer(state, action) {
  switch (action.type) {
    case 'GET_DATA_SUCCEEDED':
      return state
        .update('isLoading', () => false)
        .update('initialData', () => fromJS(action.data))
        .update('modifiedData', () => fromJS(action.data));
    case 'RESET_FORM':
      return state.update('modifiedData', () => state.get('initialData'));
    default:
      return state;
  }
}

export default reducer;
export { initialState };