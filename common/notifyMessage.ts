import * as UIkit from 'uikit';
export async function mNotification(type, icon, txt) {
    UIkit.notification({message: 
        '<span class=\'uk-margin-small-left\' uk-icon=\'icon: '+ icon +'\'></span><span class=\'uk-text-small\'>'+ txt  +'</span>',
         status: type})    
}

