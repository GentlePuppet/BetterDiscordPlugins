/**
 * @name Looping Videos Plugin
 * @author GentlePuppet
 * @authorId 199263542833053696
 * @version 1.0
 * @description A plugin that makes videos loop when they are played.
 */

module.exports = class {
    start() {
        document.addEventListener("mousemove", this.lvfe);
    };
    
    //---- Track Mouse Event Handler
    lvfe = (e) => this.addLoopAttributeToVideo(e);
    
    stop() {
        document.removeEventListener('mousemove', this.lvfe);
    };
    
    addLoopAttributeToVideo(e) {
        var videos = document.getElementsByTagName("video");
        for (var i = 0; i < videos.length; i++) {
            if (videos[i] === e.target) {
                videos[i].setAttribute("loop", "true");
            }
        };
    };    
};
