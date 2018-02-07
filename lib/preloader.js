;(function (root) {
    class Preloader {
        constructor () {
            this.loaded = false
            this.resolved = 0
            this.rejected = 0
            this.total = 0
        }
        preload (...args) {
            args = args.reduce((result, item) => {
                Array.isArray(item) ? result.push(...item) : result.push(item)
                return result
            }, [])
            this.total = args.length
    
            let promises = args.map((url) => {
                return Preloader.singleLoad(url, this).then((value) => {
                    this.resolved++
                    return {
                        value: value,
                        status: true
                    }
                }, (value) => {
                    this.rejected++
                    return {
                        value: value,
                        status: false
                    }
                }).then((value) => {
                    this.loaded = (this.total === (this.resolved + this.rejected))
                    if (typeof this.onProgress === 'function') {
                        this.onProgress(Object.assign({
                            total: this.total,
                            count: this.resolved + this.rejected,
                            resolved: this.resolved,
                            rejected: this.rejected,
                            loaded: this.loaded
                        }, value))
                    }
                    return value
                })
            })
    
            return Promise.all(promises)
        }
    }
    
    Preloader.singleLoad = (imageSource, instance = Preloader) => {
        let promise = new Promise((resolve, reject) => {
            if (typeof imageSource === 'string') {
                let img = new Image()
                img.onload = resolve.bind(null, img)
                img.onerror = img.onabort = reject.bind(null, img)
                img.src = imageSource
            }
        }).catch((brokenImage) => {
            if (instance.fallbackImage) {
                return Preloader.singleLoad(instance.fallbackImage).then((fallbackImage) => {
                    brokenImage.setAttribute('data-fail-src', brokenImage.src)
                    brokenImage.src = fallbackImage.src
                    return brokenImage
                }, () => {
                    return Promise.reject(brokenImage)
                })
            }
            return Promise.reject(brokenImage)
        })
    
        return promise
    }
    
    if (typeof define !== 'undefined' && define.amd) {
        define([], function () {
            return Preloader
        })
    } else if (typeof module !== 'undefined' && module.exports) {
        module.exports = Preloader
    } else {
        root.Preloader = Preloader
    }
}(this))