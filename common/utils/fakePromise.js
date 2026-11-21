export default function(){
    return new Promise((resolve, reject) => {
        setTimeout(() => {
          return resolve()
        }, 1000);
      });
}