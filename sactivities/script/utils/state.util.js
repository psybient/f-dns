let state = {};

export const getState = () => state;

export const setState = nextState => {
    state = nextState;
    //console.log(state)
};

// const setState = (nextState) => {
        //     const currentState = { ...state };
        //     let newState = { ...currentState, nextState };
        //     if (!_.isEqual(currentState, newState))
        //         state = { ...currentState, nextState }
        // }