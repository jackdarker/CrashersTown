"use strict";
//drag and drop rectangles into a tile-grid

(function(definition) {
    /* global module, define */
    if (typeof module === 'object' && typeof module.exports === 'object') {
      module.exports = definition();
    } else if (typeof define === 'function' && define.amd) {
      define([], definition);
    } else {
      var exports = definition();
      window.gm.startBoxSort = exports.game;
    }
  })(function() { //-> module starts here
        function game(paramms){

            var opt = {
                tileSize: 64,
                animationSpeed: 500,
                gridRef: paramms.grid,
                listRef: paramms.list,
                cardback: 'red',
                cardsUrl: 'assets/Rooms.png'
            };
            var zIndexCounter = 1;
        
        /* some base class extending array to hold  cards*/
    function Container() {  }
    Container.prototype = new Array();
    Container.prototype.extend = function(obj) {
      for (var prop in obj) {
        this[prop] = obj[prop];
      }
    }
    Container.prototype.extend({
        addCard: function(card) {
            this.addCards([card]);
        },
    
        addCards: function(cards) {
            for (var i = 0; i < cards.length; i++) {
                var card = cards[i];
                if (card.container) {
                    card.container.removeCard(card);
                }
                this.push(card);
                card.container = this;
            }
        },

        removeCard: function(card) {
            for (var i = 0; i < this.length; i++) {
                if (this[i] == card) {
                    this.splice(i, 1);
                    return true;
                }
            }
            return false;
        },
        init: function(options) {
            options = options || {};
            this.ID = options.ID;
            let _el=document.getElementById(this.ID);
            this.x = options.x || _el.clientWidth / 2;
            this.y = options.y || _el.clientHeight / 2;
            this.faceUp = options.faceUp;
            _el.ondrop=this.dropHandler;
            _el.ondragover=this.dragoverHandler;
        },
    
        click: function(func, context) {
            this._click = {
            func: func,
            context: context
            };
        },
        dragstartHandler: function(ev) {
            ev.dataTransfer.setData("text", ev.target.id);
        },
        dragoverHandler: function (ev) {
            ev.preventDefault();
        },
        dropHandler: function (ev) {
            ev.preventDefault();
            const data = ev.dataTransfer.getData("text");
            ev.target.appendChild(document.getElementById(data));
        },
        /*
        mousedown: function(func, context) {
            this._mousedown = {
            func: func,
            context: context
            };
        },
    
        mouseup: function(func, context) {
            this._mouseup = {
            func: func,
            context: context
            };
        },*/
  
      render: function(options) {
        options = options || {};
        var speed = options.speed || opt.animationSpeed;
        this.calcPosition(options);
        for (var i = 0; i < this.length; i++) {
          var card = this[i];
          zIndexCounter++;
          card.moveToFront();
          var top = parseInt($(card.el).css('top'));
          var left = parseInt($(card.el).css('left'));
          if (top != card.targetTop || left != card.targetLeft) {
            var props = {
              top: card.targetTop,
              left: card.targetLeft,
              queue: false
            };
            if (options.immediate) {
              $(card.el).css(props);
            } else {
              $(card.el).animate(props, speed);
            }
          }
        }
        var me = this;
        var flip = function() {
          for (var i = 0; i < me.length; i++) {
            if (me.faceUp) {
              me[i].showCard();
            } else {
              me[i].hideCard();
            }
          }
        }
        if (options.immediate) {
          flip();
        } else {
          setTimeout(flip, speed / 2);
        }
  
        if (options.callback) {
          setTimeout(options.callback, speed);
        }
      },
  
      topCard: function() {
        return this[this.length - 1];
      },
  
      toString: function() {
        return 'Container';
      }
    });
    /////////////////////////////////////////
    /* a visible card */
    function Card(suit, rank, table) {  this.init(suit, rank, table); }
      Card.prototype = {
        init: function(suit, rank, table) {
          this.shortName = suit + rank;
          this.suit = suit;
          this.rank = rank;
          this.name = suit.toUpperCase() + rank;
          this.el = document.createElement('div');//$('<div/>').css({
          this.el.style.width= opt.tileSize+'px',
          this.el.style.height= opt.tileSize+'px',
          this.el.style["background-image"]= 'url(' + opt.cardsUrl + ')',
          this.el.style.position= 'absolute',
          this.el.style.cursor= 'pointer';
          this.el.classList.add('card')
          //this.el.data('card', this)
          document.getElementById(table.ID).appendChild(this.el);
          this.el.draggable=true;
          this.el.ondragstart=table.dragstartHandler;
          this.showCard();
          this.moveToFront();
        },
        
        toString: function() {
          return this.name;
        },
    
        moveTo: function(x, y, speed, callback) {
          var props = {
            top: y - (opt.tileSize / 2),
            left: x - (opt.tileSize / 2)
          };
          $(this.el).animate(props, speed || opt.animationSpeed, callback);
        },
    
        rotate: function(angle) {
          $(this.el)
            .css('-webkit-transform', 'rotate(' + angle + 'deg)')
            .css('-moz-transform', 'rotate(' + angle + 'deg)')
            .css('-ms-transform', 'rotate(' + angle + 'deg)')
            .css('transform', 'rotate(' + angle + 'deg)')
            .css('-o-transform', 'rotate(' + angle + 'deg)');
        },
    
        showCard: function() {
          var offsets = {
            "c": 0,
            "d": 1,
            "h": 2,
            "s": 3,
            "rj": 2,
            "bj": 3
          };
          var xpos, ypos;
          var rank = this.rank;
          xpos = -rank * opt.tileSize;
          ypos = -offsets[this.suit] * opt.tileSize;
          this.rotate(0);
          $(this.el).css('background-position', xpos + 'px ' + ypos + 'px');
        },
    
        hideCard: function(position) {
          var y = opt.cardback == 'red' ? 0 * opt.tileSize : -1 * opt.tileSize;
          $(this.el).css('background-position', '0px ' + y + 'px');
          this.rotate(0);
        },
    
        moveToFront: function() {
          $(this.el).css('z-index', zIndexCounter++);
        }
      };
    /////////////////////////////////////////
    /* a visible hand of cards */
    function Hand(options) { this.init(options); }
    Hand.prototype = new Container();
    Hand.prototype.extend({
        calcPosition: function(options) {
            options = options || {};
            var width = opt.tileSize ;//+ (this.length - 1) * opt.cardSize.padding;
            var left = Math.round(this.x - width / 2);
            var top = Math.round(this.y - opt.tileSize / 2, 0);
            for (var i = 0; i < this.length; i++) {
                this[i].targetTop = top;
                this[i].targetLeft = left ;//+ i * opt.cardSize.padding;
            }
        },

        toString: function() {
            return 'Hand';
        }
    });
    ////////////// game //////////////////////////
        //call to initialize game
        function start(options) {
            if (options) {
                for (var i in options) {
                    if (opt.hasOwnProperty(i)) {
                    opt[i] = options[i];
                    }
                }
            }
            debugger
            var source = new Hand({ID:opt.listRef});
            var target = new Hand({ID:opt.gridRef});
            source.addCard(new Card('c', 1, source));
            source.render();
            target.render();
        }
        let data ={ //internal state of game
            start: start, //ref to start-function
            Hand:Hand,
            Card:Card,
        }
        return(data)
    }
//-> module ends here
return {
    game:game
  };
});