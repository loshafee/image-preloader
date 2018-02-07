;(function (root) {
    /**
     * Preloader 图片加载器，代表一个图片预加载
     * 
     */
    class Preloader {
        /**
         * 预加载属性
         * @property {boolean} loaded - 加载完成
         * @property {Number} resolved - resolved 状态的图片数量
         * @property {Number} rejected - rejected 状态的图片数量
         * @property {Number} total - 加载图片总量
         */
        constructor () {
            this.loaded = false
            this.resolved = 0
            this.rejected = 0
            this.total = 0
        }
        /**
         * 图片预加载器，请求参数中的所有图片加载完成，返回promise对象
         * @param {String/Array} args - 所要加载图片的路径，可为字符串或数组
         * @return {Promise} - 图片加载完成的promise
         */
        preload (...args) {
            /** 处理参数为字符串或数组 */
            args = args.reduce((result, item) => {
                Array.isArray(item) ? result.push(...item) : result.push(item)
                return result
            }, [])
            this.total = args.length
    
            let promises = args.map((url) => {
                /**
                 * 处理单一图片请求成功之后promise `then` 函数的返回值
                 * 并调用返回成功的回调函数 onProgress
                 */
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
    
    /**
     * 类方法，请求一张图片方式
     * @param {String} imageSource - 图片url
     * @param {Class} instance - 图片加载失败，默认替换图片的加载器
     */
    Preloader.singleLoad = (imageSource, instance = Preloader) => {
        let promise = new Promise((resolve, reject) => {
            if (typeof imageSource === 'string') {
                /**
                 * 根据url地址请求图片
                 * 成功状态处理 resolve
                 * 失败状态处理 reject
                 */
                let img = new Image()
                img.onload = resolve.bind(null, img)
                img.onerror = img.onabort = reject.bind(null, img)
                img.src = imageSource
            }
        }).catch((brokenImage) => {
            /**
             * 上一步骤中图片请求失败，根据instance是否设置fallbackImage来判断是否替换加载失败图片
             */
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
    
    /** 模块化封装，适用于CommonJS, AMD 以及浏览器环境 */
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