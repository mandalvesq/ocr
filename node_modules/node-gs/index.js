var { spawn } = require( 'child_process' ),
	{ EventEmitter } = require( 'events' );

var gs = function gs ( inputFile ) {
		this.options = [];

		return this.executablePath( '' ).input( inputFile );
	},

	create = function create ( inputFile ) {
		return new gs( inputFile );
	},

	isFunction = function isFunction ( functionToCheck ) {
		return ( !!functionToCheck && ( {}.toString.call( functionToCheck ) === '[object Function]' ) );
	};

gs.prototype.__proto__ = EventEmitter.prototype;

gs.prototype.batch = function () {
	return this.define( 'BATCH' );
};

gs.prototype.command = function ( cmd ) {
	this.options.push( '-c', cmd.replace( /(\s)/g, '\ ' ) );

	return this;
};

gs.prototype.currentDirectory = function () {
	this.define( '', '', 'p' );

	return this;
};

gs.prototype.diskfonts = function () {
	return this.define( 'DISKFONTS' );
};

gs.prototype.define = function ( key, val, mod ) {
	mod = mod || 'd';

	this.options.push( '-' + mod + key + ( val ? '=' + val : '' ) );

	return this;
};

gs.prototype.device = function ( device ) {
	device = device || 'txtwrite';

	return this.define( 'DEVICE', device, 's' );
};

gs.prototype.executablePath = function ( path ) {
	this._executablePath = path;

	return this;
};

gs.prototype.include = function ( path ) {
	if ( path == undefined ) throw new Error( 'Include path is not specified' );

	if ( Array.isArray( path ) ) path = path.join( ':' );

	this.options = this.options.concat( [ '-I', path ] );

	return this;
}

gs.prototype.input = function ( fileNameOrData ) {
	this._input = fileNameOrData || '-';

	return this;
};

gs.prototype.nobind = function () {
	return this.define( 'NOBIND' );
};

gs.prototype.nocache = function () {
	return this.define( 'NOCACHE' );
};

gs.prototype.nodisplay = function () {
	return this.define( 'NODISPLAY' );
};

gs.prototype.nopause = function () {
	return this.define( 'NOPAUSE' );
};

gs.prototype.option = function ( option ) {
	this.options.push( option );

	return this;
};

gs.prototype.output = function ( file ) {
	file = file || '-';

	this.define( 'OutputFile', file, 's' );

	if ( file === '-' ) return this.q();

	return this;
};

gs.prototype.p = gs.prototype.currentDirectory;

gs.prototype.page = function ( page ) {
	return this.define( 'FirstPage', page ).define( 'LastPage', page );
};

gs.prototype.pagecount = function ( callback ) {
	var self = this;

	if ( !self._input || self._input === '-' ) return callback.call( self, 'No input specified' );

	self.q()
		.command( '(' + self._input + ') (r) file runpdfbegin pdfpagecount = quit' )
		.exec( function ( error, data ) {
			if ( error ) return callback.call( self, error );

			return callback.call( self, null, data );
		});
};

gs.prototype.pages = function ( from, to ) {
	return this.define( 'FirstPage', from ).define( 'LastPage', to );
};

gs.prototype.papersize = function ( size ) {
	return this.define( 'PAPERSIZE', size, 's' );
};

gs.prototype.quiet = function () {
	this.define( '', '', 'q' );

	return this;
};

gs.prototype.q = gs.prototype.quiet;

gs.prototype.reset = function () {
	this.options = [];

	return this.executablePath( '' ).input();
};

gs.prototype.resolution = function ( xRes, yRes ) {
	this.options.push( '-r' + xRes + ( yRes ? 'x' + yRes : '' ) );

	return this;
};

gs.prototype.res = gs.prototype.r = gs.prototype.resolution;

gs.prototype.safer = function () {
	return this.define( 'SAFER' );
};

gs.prototype.exec = function ( inputData, callback ) {
	var _callback = callback;

	if ( _callback ) {
		if ( !inputData ) return _callback.call( this, 'No input data specified' );
	} else if ( isFunction( inputData ) ) {
		_callback = inputData;

		if ( this._input === '-' ) return _callback.call( this, 'No input data specified' );
	} else {
		throw new Error( this, 'No callback specified' );
	}

	var self = this,
		executable = ( self._executablePath ) ? self._executablePath : 'gs',
		files = [].concat( self._input ),
		args = this.options.concat( files ),
		gsData = [],
		totalBytes = 0,
		proc;

	if ( self._input === '-' ) {
		proc = spawn( executable, args, {
			stdio: [
				'pipe'
			]
		});

		proc.stdin.setEncoding( 'utf8' );

		proc.stdin.write( inputData );

		proc.stdin.end();
	} else {
		proc = spawn( executable, args );
	}

	proc.stdin.on( 'error', _callback );
	proc.stdout.on( 'error', _callback );

	proc.stderr.on( 'data', function ( data ) {
		_callback( data.toString() );
	});

	proc.stdout.on( 'data', function ( data ) {
		var dataString = data.toString(),
			pageMatch = /Page (.*)/,
			pagesMatch = /Processing pages (.*) through (.*)\./;

		totalBytes += data.length;
		gsData.push( data );

		self.emit( 'data', data );

		if ( dataString.match( pagesMatch ) ) self.emit( 'pages', RegExp.$1, RegExp.$2 );

		if ( dataString.match( pageMatch ) ) self.emit( 'page', RegExp.$1 );
	});

	proc.on( 'close', function () {
		var buffer = Buffer.concat( gsData, totalBytes );

		_callback.call( self, null, buffer );

		return self.emit( 'close' );
	});

	process.on( 'exit', function () {
		proc.kill();

		self.emit( 'exit' );
	});
};

module.exports = exports = create;
