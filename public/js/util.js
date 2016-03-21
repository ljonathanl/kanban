function createSocket(path) {
  var socket = io.connect(path);

  // hack of socket.io for kermit hosting
  if (window.location.hostname.indexOf("kermit") >= 0) {
    var enginePrototype = Object.getPrototypeOf(socket.io.engine);
    var oldCreateTransport = enginePrototype.createTransport;
    var initHack = false;
    enginePrototype.createTransport = function (name) {
        var instance = oldCreateTransport.call(this, name);
        if (name == "websocket" && !initHack) {
            initHack = true;
            var wsPrototype = Object.getPrototypeOf(instance);
            var oldUri = wsPrototype.uri;
            wsPrototype.uri = function () {
                var result = oldUri.apply(this);
                var index = result.indexOf("socket.io");
                var scheme = "ws";
                if (result.indexOf("wss") == 0) {
                    scheme = "wss";
                }
                result = result.substring(0, index) + "_" + scheme + "/" + result.substring(index);
                return result;
            };
        }
        return instance;
    }
  }

  return socket;
}

Vue.directive('drop-target', {
  params: [
    'accept-drop',
    'drop'
  ],
  bind: function () {
    this.handleDragOver = function(e) {
      if (typeof(this.vm[this.params.acceptDrop]) === 'function') {
        var dropAllowed = this.vm[this.params.acceptDrop].call(this, e);
        if (!dropAllowed) return false;
      } 
      e.preventDefault();
      e.stopPropagation();
      e.dataTransfer.dropEffect = 'move';
      this.el.classList.add('drag-over');
      return false;
    }.bind(this);
    this.handleDragLeave = function(e) {
      e.stopPropagation();
      this.el.classList.remove('drag-over');
    }.bind(this);
    this.handleDrop = function(e) {
      if (typeof(this.vm[this.params.acceptDrop]) === 'function') {
        var dropAllowed = this.vm[this.params.acceptDrop].call(this, e);
        if (!dropAllowed) return false;
      }
      e.preventDefault(); 
      e.stopPropagation();
      if (typeof(this.vm[this.params.drop]) === 'function') {
        this.vm[this.params.drop].call(this, e);
      }
      this.el.classList.remove('drag-over');
      return false;
    }.bind(this);
    // setup the listeners
    this.el.addEventListener('dragover', this.handleDragOver, false);
    this.el.addEventListener('dragleave', this.handleDragLeave, false);
    this.el.addEventListener('drop', this.handleDrop, false);
  },
  unbind: function () {
    // shut er' down
    this.el.classList.remove('dragging', 'drag-over');
    this.el.removeEventListener('dragover', this.handleDragOver);
    this.el.removeEventListener('dragleave', this.handleDragLeave);
    this.el.removeEventListener('drop', this.handleDrop);
  }
});

Vue.directive('drag-source', {
  params: [
    'drag-start',
  ],
  bind: function () {
    this.handleDragStart = function (e) {
      e.target.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
      // Need to set to something or else drag doesn't start
      e.dataTransfer.setData('fake', '*');
      if (typeof(this.vm[this.params.dragStart]) === 'function') {
        this.vm[this.params.dragStart].call(this, e);
      }
      this.el.addEventListener('dragend', this.handleDragEnd, false);
    }.bind(this);

    this.handleDragEnd = function(e) {
      e.target.classList.remove('dragging');
    }.bind(this);

    // setup the listeners
    this.el.addEventListener('dragstart', this.handleDragStart, false);
  },
  unbind: function () {
    // shut er' down
    this.el.classList.remove('dragging', 'drag-over', 'drag-enter');
    this.el.removeEventListener('dragstart', this.handleDragStart);
    this.el.removeEventListener('dragend', this.handleDragEnd);
  }
});

Vue.directive('rich-editor', {
  twoWay: true,

  bind: function () {
    this.onChange = function() {
      this.set(this.editor.getData());
    }.bind(this);
    this.setUpEditor = function () {
      this.editor = CKEDITOR.replace(this.el.id);
      this.editor.config.height = 300;
      this.editor.on('change', this.onChange);
    }.bind(this);
    Vue.nextTick(this.setUpEditor);
  },

  update: function (value) {
    if (!this.editor) return Vue.nextTick(this.update.bind(this, value));
    this.editor.setData(value);
  },

  unbind: function () {
    this.editor.destroy();
  }
})
  