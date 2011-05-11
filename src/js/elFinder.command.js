/**
 * elFinder command prototype
 *
 * @type  elFinder.command
 * @author  Dmitry (dio) Levashov
 */
elFinder.prototype.command = function(fm) {

	/**
	 * elFinder instance
	 *
	 * @type  elFinder
	 */
	this.fm = fm;
	
	/**
	 * Command prototype object.
	 * Added by elFinder on command creation
	 *
	 * @type  elFinder.command
	 */
	// this._super = null;
	
	/**
	 * Command name, same as class name
	 *
	 * @type  String
	 */
	this.name = '';
	
	/**
	 * Short command description
	 *
	 * @type  String
	 */
	this.title = '';
	
	/**
	 * Current command state
	 *
	 * @type  Number
	 */
	this.state = fm.cmdStateDisabled;
	
	/**
	 * If true, command can not be disabled by connector.
	 * @see this.update()
	 *
	 * @type  Boolen
	 */
	this.alwaysEnabled = false;
	
	/**
	 * elFinder events handlers
	 *
	 * @type  Object
	 */
	this.handlers = {
		enable  : function() { this.update(); },
		disable : function() { this.update(fm.cmdStateDisabled); },
		open    : function() { this.update(); },
	};
	
	/**
	 * Shortcuts
	 *
	 * @type  Array
	 */
	this.shortcuts = [];
	
	/**
	 * Command options
	 *
	 * @type  Object
	 */
	this.options = {ui : 'button'};
	
	
	/**
	 * Prepare object -
	 * bind events and shortcuts
	 *
	 * @return void
	 */
	this.setup = function(name, opts) {
		var self = this,
			fm   = this.fm;
		
		this.name      = name;
		this.title     = fm.i18n(this.title || this.name);
		this.options   = $.extend({}, this.options, opts);
		this.listeners = [];

		$.each(this.handlers, function(cmd, handler) {
			fm.bind(cmd, $.proxy(handler, self));
		});

		$.each(this.shortcuts, function(i, s) {
			fm.shortcut(s);
		});
		
		this._init();
	}

	/**
	 * Command specific init stuffs
	 *
	 * @return void
	 */
	this._init = function() { }

	/**
	 * Exec command if it is enabled and return result
	 *
	 * @param  mixed  command value
	 * @return $.Deferred
	 */
	this.exec = function(v) { 
		return this.enabled() ? this._exec(v) : $.Deferred().reject({error : 'Command disabled'});
	}
	
	/**
	 * Here command do smth usefull
	 *
	 * @param  mixed  command value
	 * @return $.Deferred
	 */
	this._exec = function(v) { 
		return $.Deferred().reject(); 
	}
	
	/**
	 * Return true if command disabled.
	 *
	 * @return Boolen
	 */
	this.disabled = function() {
		return this.state == this.fm.cmdStateDisabled;
	}
	
	/**
	 * Return true if command enabled.
	 *
	 * @return Boolen
	 */
	this.enabled = function() {
		return this.state != this.fm.cmdStateDisabled;
	}
	
	/**
	 * Return true if command active.
	 *
	 * @return Boolen
	 */
	this.active = function() {
		return this.state == this.fm.cmdStateActive;
	}
	
	/**
	 * Return current command state.
	 * Must be overloaded in most commands
	 *
	 * @return Number
	 */
	this.getstate = function() {
		return this.fm.cmdStateDisabled;
	}
	
	/**
	 * Update command state/value
	 * and rize 'cahnge' event if smth changed
	 *
	 * @param  Number  new state or undefined to auto update state
	 * @param  mixed   new value
	 * @return void
	 */
	this.update = function(s, v) {
		var state = this.state,
			value = this.value;

		if (this.alwaysEnabled) {
			this.state = this.getstate();
		} else if (!this.fm.isCommandEnabled(this.name)) {
			this.state = fm.cmdStateDisabled;
		} else {
			this.state = s !== void(0) ? s : this.getstate();
		}

		this.value = v;
		
		if (state != this.state || value != this.value) {
			this.change();
		}
	}
	
	/**
	 * Bind handler / rize 'change' event.
	 *
	 * @param  Function|undefined  event callback
	 * @return void
	 */
	this.change = function(c) {
		var cmd, i;
		
		if (typeof(c) === 'function') {
			this.listeners.push(c);			
		} else {
			for (i = 0; i < this.listeners.length; i++) {
				cmd = this.listeners[i];
				try {
					cmd.call(this, this.state, this.value);
				} catch (e) {
					this.fm.debug('error', e)
				}
			}

		}
	}
}
