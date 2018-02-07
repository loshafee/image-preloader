# image-preloader
Simple, modern and effective html images perloader

## Usage

    let preloader = new Preloader()
    preloader.onProgress = (info) => {
        console.log(info, info.count, info.total)
    }
    preloader.preload(url, url2, url3, ...)
             .then((status) => {
                 console.log('all done!', status)
             })


## Reference
Refer [ImagePreloader](https://github.com/smelukov/ImagePreloader)