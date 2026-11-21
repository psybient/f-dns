import { getState, setState } from './app/appState';
import { ls } from './app/localStorage';


export const setUserVisit = () => {
    var counter = ls.get("visitCount") || 0;
    // allCookies = document.cookie;
    // document.cookie = newCookie
    ls.set({
        ...getState(),
        visitCount: counter + 1
    });

    //this.setState({...ls.getStorage()});
    setState({ ...ls.getStorage() });
    // console.log(this.getState());
    // console.log(getState())
}