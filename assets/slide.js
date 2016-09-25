"use strict";
var container = document.querySelector(".slide-container");
var previous = document.querySelector('.previous');
var next = document.querySelector('.next');
previous.addEventListener('click', function(){
    slider.previous();
});
next.addEventListener('click', function(){
    slider.next();
});

function Slider(elem){
    this._currIndex = 0;
    this._element = elem;
    this._containerWidth = elem.clientWidth || 320;
    this._duration = '.5s';
    this._items = elem.querySelectorAll('.slide');
    this._itemsCount = this._items.length;
    this._animating = false;
    this._touching = false;
    this._startTouch = null;
    this._init();
}
Slider.prototype._init = function(){
    this._setLayout();
    if(this._itemsCount >= 3){
        this._binds();
    }
};
Slider.prototype._binds = function(){
    this._element.addEventListener('webkitTransitionEnd', this._onTransitionEnd.bind(this));
    this._element.addEventListener('transitionend', this._onTransitionEnd.bind(this));
    this._element.addEventListener('touchstart', this._onTouchStart.bind(this));
    this._element.addEventListener('touchmove', this._onTouchMove.bind(this));
    this._element.addEventListener('touchend', this._onTouchEnd.bind(this));
};
Slider.prototype.next = function(){
    this._move(1);
};
Slider.prototype.previous = function(){
    this._move(-1);
};
Slider.prototype._move = function(dir){
    if(this._animating){
        return false;
    }
    this._animating	= true;
    if(dir > 0){
        //next
        if(this._currIndex >= this._itemsCount - 1){
            this._currIndex = 0;
        }else{
            this._currIndex ++;
        }

        this._setDuration(this._currItem, this._duration);
        this._setDuration(this._rightItem, this._duration);
        // current item moves left
        this._css( this._currItem, this._layouts['left'] );
        // right item moves to the center
        this._css( this._rightItem, this._layouts['center'] );

        // next item moves to the right
        if( this._nextItem ) {
            this._setDuration(this._leftItem, this._duration);
            this._setDuration(this._nextItem, this._duration);
            // left item moves out
            this._css( this._leftItem, this._layouts['outLeft'] );
            this._css( this._nextItem, this._layouts['right'] );
        }
        else {
            this._setDuration(this._leftItem, this._duration);
            // left item moves right
            this._css( this._leftItem, this._layouts['right'] );
        }

    }else{
        //previous
        if(this._currIndex <= 0){
            this._currIndex = this._itemsCount - 1;
        }else{
            this._currIndex --;
        }

        this._setDuration(this._currItem, this._duration);
        this._setDuration(this._leftItem, this._duration);
        // current item moves right
        this._css( this._currItem, this._layouts['right'] );

        // left item moves to the center
        this._css( this._leftItem, this._layouts['center'] );

        // previous item moves to the left
        if( this._prevItem ) {
            this._setDuration(this._rightItem, this._duration);
            this._setDuration(this._prevItem, this._duration);

            // right item moves out
            this._css( this._rightItem, this._layouts['outRight'] );
            this._css( this._prevItem, this._layouts['left'] );
        }
        else {
            this._setDuration(this._rightItem, this._duration);
            // right item moves left
            this._css( this._rightItem, this._layouts['left'] );
        }
    }
    this._setItems();
};
//回滚原来位置
Slider.prototype._fallback = function(){
    this._setDuration(this._currItem, this._duration);
    this._css(this._currItem, this._layouts['center']);
    this._setDuration(this._leftItem, this._duration);
    this._css(this._leftItem, this._layouts['left']);
    this._setDuration(this._rightItem, this._duration);
    this._css(this._rightItem, this._layouts['right']);
    if(this._prevItem){
        this._setDuration(this._prevItem, this._duration);
        this._css(this._prevItem, this._layouts['outLeft']);
    }
    if(this._nextItem){
        this._setDuration(this._nextItem, this._duration);
        this._css(this._nextItem, this._layouts['outRight']);
    }
};
Slider.prototype._onTransitionEnd = function(){
    for(var i= 0, len=this._items.length; i<len; i++){
        this._setDuration(this._items[i], '0s');
    }
    this._animating	= false;
};
Slider.prototype._onTouchStart = function(e){
    if(this._animating){
        this._touching = false;
        return false;
    }
    if(this._touching){
        return false;
    }
    this._touching = true;
    this._startTouch = e.targetTouches[0];
    e.stopPropagation();
};
Slider.prototype._onTouchMove = function(e){
    if(!this._touching){
        return;
    }
    var currX = e.targetTouches[0].pageX;
    var delta = currX - this._startTouch.pageX;
    //动画过程百分比
    var ratio = Math.abs(delta) / this._containerWidth * 1.5; //放大1.5倍，使触摸更明显
    if(ratio > 1){
        ratio = 1;
    }
    if(delta > 0){
        this._touchMove(this._currItem, 'center', 'right', ratio);
        this._touchMove(this._leftItem, 'left', 'center', ratio);
        this._touchMove(this._rightItem, 'right', 'outRight', ratio);
        if(this._prevItem){
            this._touchMove(this._prevItem, 'outLeft', 'left', ratio);
        }
    }else{
        this._touchMove(this._currItem, 'center', 'left', ratio);
        this._touchMove(this._leftItem, 'left', 'outLeft', ratio);
        this._touchMove(this._rightItem, 'right', 'center', ratio);
        if(this._nextItem){
            this._touchMove(this._nextItem, 'outRight', 'right', ratio);
        }
    }
    e.stopPropagation();
};
Slider.prototype._touchMove = function(elem, from, to, ratio){
    var fromData = this._animates[from],
        toData = this._animates[to];

    var transX = fromData.transform[0] + (toData.transform[0] - fromData.transform[0]) * ratio;
    var scale = fromData.transform[1] + (toData.transform[1] - fromData.transform[1]) * ratio;
    var opacity = fromData.opacity + (toData.opacity - fromData.opacity) * ratio;
    var zIndex = Math.round(fromData.zIndex + (toData.zIndex - fromData.zIndex) * ratio);
    this._css(elem, {
        webkitTransform: 'translate('+transX+'%) scale('+scale+')',
        transform: 'translate('+transX+'%) scale('+scale+')',
        opacity: opacity,
        zIndex: zIndex
    });
};
Slider.prototype._onTouchEnd = function(e){
    this._touching = false;
    var currX = e.changedTouches[0].pageX;
    var delta = currX - this._startTouch.pageX;
    var ratio = Math.abs(delta) / this._containerWidth;
    if(ratio > .1){
        this._move(delta > 0 ? -1 : 1);
    }else{
        this._fallback();
    }
    e.stopPropagation();
};
Slider.prototype._setItems = function(){
    var leftIndex = this._currIndex === 0 ? this._itemsCount - 1 : this._currIndex - 1,
        rightIndex = this._currIndex === this._itemsCount - 1 ? 0 : this._currIndex + 1;

    this._currItem = this._items[this._currIndex];
    this._leftItem = this._items[leftIndex];
    this._rightItem = this._items[rightIndex];

    if(this._itemsCount > 3){
        this._prevItem = this._items[leftIndex === 0 ? this._itemsCount - 1 : leftIndex -1];
        this._nextItem = this._items[rightIndex === this._itemsCount - 1 ? 0 : rightIndex + 1];

        this._css(this._prevItem, this._layouts['outLeft']);
        this._css(this._nextItem, this._layouts['outRight']);
    }
};
Slider.prototype._setLayout = function(){
    this._setItems();

    this._css(this._leftItem, this._layouts['left']);
    this._css(this._rightItem, this._layouts['right']);
    this._css(this._currItem, this._layouts['center']);
};
Slider.prototype._css = function(elem, styles){
    for(var k in styles){
        elem.style[k] = styles[k];
    }
};
Slider.prototype._setDuration = function(elem, duration){
    this._css(elem, {
        webkitTransitionDuration: duration,
        transitionDuration: duration
    })
};
Slider.prototype._layouts = {
    'outLeft': {
        webkitTransform: 'translate(-50%) scale(.7)',
        transform: 'translate(-50%) scale(.7)',
        opacity: 0,
        zIndex: 1
    },
    'left': {
        webkitTransform: 'translate(-40%) scale(.8)',
        transform: 'translate(-40%) scale(.8)',
        opacity:1,
        zIndex: 2
    },
    'center': {
        webkitTransform: 'translate(0) scale(1)',
        transform: 'translate(0) scale(1)',
        opacity: 1,
        zIndex: 3
    },
    'right': {
        webkitTransform: 'translate(40%) scale(.8)',
        transform: 'translate(40%) scale(.8)',
        opacity:1,
        zIndex: 2
    },
    'outRight': {
        webkitTransform: 'translate(50%) scale(.7)',
        transform: 'translate(50%) scale(.7)',
        opacity: 0,
        zIndex: 1
    }
};
Slider.prototype._animates = {
    'outLeft': {
        transform: [-50,.7], //[translate(x%), scale]
        opacity: 0,
        zIndex: 1
    },
    'left': {
        transform: [-40,.8],
        opacity: 1,
        zIndex: 2
    },
    'center': {
        transform: [0, 1],
        opacity: 1,
        zIndex: 3
    },
    'right': {
        transform: [40,.8],
        opacity: 1,
        zIndex: 2
    },
    'outRight': {
        transform: [50,.7],
        opacity: 0,
        zIndex: 1
    }
};
var slider = new Slider(container);
