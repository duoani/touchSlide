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

function css(elem, styles){
    for(var k in styles){
        elem.style[k] = styles[k];
    }
}

function Slider(main){
    this._currIndex = 0;
    this._container = main;
    this._containerWidth = main.clientWidth || 320;
    this._items = main.querySelectorAll('.slide');
    this._itemsCount = this._items.length;
    this._animating = false;
    this._touching = false;
    this._startTouch = null;
    this._init();
}
Slider.prototype._init = function(){
    this._setLayout();
    this._binds();
};
Slider.prototype._binds = function(){
    this._container.addEventListener('webkitTransitionEnd', this._transitionEnd.bind(this));
    this._container.addEventListener('transitionend', this._transitionEnd.bind(this));
    this._container.addEventListener('touchstart', this._touchStart.bind(this));
    this._container.addEventListener('touchmove', this._touchMove.bind(this));
    this._container.addEventListener('touchend', this._touchEnd.bind(this));
};
Slider.prototype._transitionEnd = function(){
    for(var i= 0, len=this._items.length; i<len; i++){
        this._items[i].classList.remove('og-transition');
    }
    this._animating	= false;
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

        // current item moves left
        this._currItem.classList.add('og-transition');
        this._rightItem.classList.add('og-transition');
        css( this._currItem, this._layouts['left'] );

        // right item moves to the center
        css( this._rightItem, this._layouts['center'] );

        // next item moves to the right
        if( this._nextItem ) {
            this._leftItem.classList.add('og-transition');
            this._nextItem.classList.add('og-transition');
            // left item moves out
            css( this._leftItem, this._layouts['outLeft'] );
            css( this._nextItem, this._layouts['right'] );
        }
        else {
            this._leftItem.classList.add('og-transition');
            // left item moves right
            css( this._leftItem, this._layouts['right'] );
        }

    }else{
        //previous
        if(this._currIndex <= 0){
            this._currIndex = this._itemsCount - 1;
        }else{
            this._currIndex --;
        }

        this._currItem.classList.add('og-transition');
        this._leftItem.classList.add('og-transition');
        // current item moves right
        css( this._currItem, this._layouts['right'] );

        // left item moves to the center
        css( this._leftItem, this._layouts['center'] );

        // previous item moves to the left
        if( this._prevItem ) {
            this._rightItem.classList.add('og-transition');
            this._prevItem.classList.add('og-transition');
            // right item moves out
            css( this._rightItem, this._layouts['outRight'] );
            css( this._prevItem, this._layouts['left'] );
        }
        else {
            this._rightItem.classList.add('og-transition');
            // right item moves left
            css( this._rightItem, this._layouts['left'] );
        }
    }
    this._setItems();
};
//回滚原来位置
Slider.prototype._fallback = function(){
    this._currItem.classList.add('og-transition');
    css(this._currItem, this._layouts['center']);
    this._leftItem.classList.add('og-transition');
    css(this._leftItem, this._layouts['left']);
    this._rightItem.classList.add('og-transition');
    css(this._rightItem, this._layouts['right']);
    if(this._prevItem){
        this._prevItem.classList.add('og-transition');
        css(this._prevItem, this._layouts['outLeft']);
    }
    if(this._nextItem){
        this._nextItem.classList.add('og-transition');
        css(this._nextItem, this._layouts['outRight']);
    }
};
Slider.prototype._touchStart = function(e){
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
Slider.prototype._touchMove = function(e){
    if(!this._touching){
        return;
    }
    var currX = e.targetTouches[0].pageX;
    var delta = currX - this._startTouch.pageX;
    //动画过程百分比
    var ratio = Math.abs(delta) / this._containerWidth;
    if(ratio > 1){
        ratio = 1;
    }
    console.log(ratio)
    if(delta > 0){
        this._touchMoving(this._currItem, 'center', 'right', ratio);
        this._touchMoving(this._leftItem, 'left', 'center', ratio);
        this._touchMoving(this._rightItem, 'right', 'outRight', ratio);
        if(this._prevItem){
            this._touchMoving(this._prevItem, 'outLeft', 'left', ratio);
        }
    }else{
        this._touchMoving(this._currItem, 'center', 'left', ratio);
        this._touchMoving(this._leftItem, 'left', 'outLeft', ratio);
        this._touchMoving(this._rightItem, 'right', 'center', ratio);
        if(this._nextItem){
            this._touchMoving(this._nextItem, 'outRight', 'right', ratio);
        }
    }
    e.stopPropagation();
};
Slider.prototype._touchMoving = function(elem, from, to, ratio){
    var fromData = this._layoutDelta[from],
        toData = this._layoutDelta[to];

    var transX = fromData.transform[0] + (toData.transform[0] - fromData.transform[0]) * ratio;
    var scale = fromData.transform[1] + (toData.transform[1] - fromData.transform[1]) * ratio;
    var opacity = fromData.opacity + (toData.opacity - fromData.opacity) * ratio;
    var zIndex = Math.round(fromData.zIndex + (toData.zIndex - fromData.zIndex) * ratio);
    css(elem, {
        webkitTransform: 'translate('+transX+'%) scale('+scale+')',
        transform: 'translate('+transX+'%) scale('+scale+')',
        opacity: opacity,
        zIndex: zIndex
    });
};
Slider.prototype._touchEnd = function(e){
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

        css(this._prevItem, this._layouts['outLeft']);
        css(this._nextItem, this._layouts['outRight']);
    }
};
Slider.prototype._setLayout = function(){
    this._setItems();

    css(this._leftItem, this._layouts['left']);
    css(this._rightItem, this._layouts['right']);
    css(this._currItem, this._layouts['center']);
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
        opacity:.8,
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
        opacity:.8,
        zIndex: 2
    },
    'outRight': {
        webkitTransform: 'translate(50%) scale(.7)',
        transform: 'translate(50%) scale(.7)',
        opacity: 0,
        zIndex: 1
    }
};
Slider.prototype._layoutDelta = {
    'outLeft': {
        transform: [-50,.7], //[translate(x%), scale]
        opacity: 0,
        zIndex: 1
    },
    'left': {
        transform: [-40,.8],
        opacity: .8,
        zIndex: 2
    },
    'center': {
        transform: [0, 1],
        opacity: 1,
        zIndex: 3
    },
    'right': {
        transform: [40,.8],
        opacity:.8,
        zIndex: 2
    },
    'outRight': {
        transform: [50,.7],
        opacity: 0,
        zIndex: 1
    }
};

var slider = new Slider(container);
