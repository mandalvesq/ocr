var childProcess = require( 'child_process' ),
	fs = require( 'fs' ),
	gs = require( '../index' ),
	assert = require( 'assert' );

describe( 'gs', function () {

	describe( '#batch', function () {
		it( 'should set batch option', function ( done ) {
			assert.deepEqual( gs().batch().options, [ '-dBATCH' ] );

			done();
		});
	});

	describe( '#command', function () {
		it( 'should tell gs to interpret PostScript code', function ( done ) {
			assert.deepEqual( gs().command( 'quit' ).options, [ '-c', 'quit' ] );

			done();
		});
	});

	describe( '#currentDirectory / #p', function () {
		it( 'should tell gs to use current directory for libraries first', function ( done ) {
			assert.deepEqual( gs().p().options, [ '-p' ] );

			done();
		});
	});

	describe( '#diskfonts', function () {
		it( 'should set diskfonts option', function ( done ) {
			assert.deepEqual( gs().diskfonts().options, [ '-dDISKFONTS' ] );

			done();
		});
	});

	describe( '#define', function () {
		it( 'should set definition with value', function ( done ) {
			assert.deepEqual( gs().define( 'FirstPage', 1 ).options, [ '-dFirstPage=1' ] );

			done();
		});
	});

	describe( '#device', function () {
		it( 'should set device option with default', function ( done ) {
			assert.deepEqual( gs().device().options, [ '-sDEVICE=txtwrite' ] );

			done();
		});

		it( 'should set device option with value', function ( done ) {
			assert.deepEqual( gs().device( 'bacon' ).options, [ '-sDEVICE=bacon' ] );

			done();
		});
	});

	describe( '#executablePath', function () {
		it( 'should set path of executable', function ( done ) {
			assert.equal( gs().executablePath( 'executablePath' )._executablePath, 'executablePath' );

			done();
		});
	});

	describe( '#include', function () {
		it( 'should raise an error for null include path', function ( done ) {
			assert.throws( function () {
				gs().include();
			}, Error );

			done();
		});

		it( 'should set include option', function ( done ) {
			const input = '/opt/my app/Init';
			const good = [ '-I', '/opt/my app/Init' ];

			assert.deepEqual( gs().include( input ).options, good );

			done();
		});

		it( 'should set array of include paths', function ( done ) {
			const input = [ '/opt/my app/Init', '/tmp', '.' ];
			const good = [ '-I', '/opt/my app/Init:/tmp:.' ];

			assert.deepEqual( gs().include( input ).options, good );

			done();
		});
	});

	describe( '#input', function () {
		it( 'should set inputs with default', function ( done ) {
			assert.deepEqual( gs().input()._input, '-' );

			done();
		});

		it( 'should set inputs with file', function ( done ) {
			assert.deepEqual( gs().input( 'file' )._input, 'file' );

			done();
		});
	});

	describe( '#nobind', function () {
		it( 'should set nobind option', function ( done ) {
			assert.deepEqual( gs().nobind().options, [ '-dNOBIND' ] );

			done();
		});
	});

	describe( '#nocache', function () {
		it( 'should set nocache option', function ( done ) {
			assert.deepEqual( gs().nocache().options, [ '-dNOCACHE' ] );

			done();
		});
	});

	describe( '#nodisplay', function () {
		it( 'should set nodisplay option', function ( done ) {
			assert.deepEqual( gs().nodisplay().options, [ '-dNODISPLAY' ] );

			done();
		});
	});

	describe( '#nopause', function () {
		it( 'should set nopause option', function ( done ) {
			assert.deepEqual( gs().nopause().options, [ '-dNOPAUSE' ] );

			done();
		});
	});

	describe( '#option', function () {
		it( 'should set option', function ( done ) {
			assert.deepEqual( gs().option( '-r' + 50 * 2 ).options, [ '-r100' ] );

			done();
		});
	});

	describe( '#output', function () {
		it( 'should set output option with default', function ( done ) {
			assert.deepEqual( gs().output().options, [ '-sOutputFile=-', '-q' ] );

			done();
		});

		it( 'should set output option with value', function ( done ) {
			assert.deepEqual( gs().output( 'bacon' ).options, [ '-sOutputFile=bacon' ] );

			done();
		});
	});

	describe( '#page', function () {
		it( 'should tell gs to process single page', function ( done ) {
			gs()
				.nopause()
				.input( './tests/pdfs/sizes.pdf' )
				.output( './test/pdfs/sizes-%d.jpg' )
				.page( 2 )
				.on( 'pages', function ( from, to ) {
					assert.equal( from, 2 );
					assert.equal( to, 2 );

					done();
				})
				.exec( function ( err, data ) {} );
		});
	});

	describe( '#pagecount', function () {
		it( 'should return number of pages', function ( done ) {
			gs()
				.input( './tests/pdfs/sizes.pdf' )
				.pagecount( function ( err, count ) {
					assert.ok( !err );
					assert.equal( count, 3 );

					done();
				});
		});
	});

	describe( '#pages', function () {
		it( 'should tell gs to process page range', function ( done ) {
			gs()
				.nopause()
				.input( './tests/pdfs/sizes.pdf' )
				.output( './test/pdfs/sizes-%d.jpg' )
				.pages( 1, 2 )
				.on( 'pages', function ( from, to ) {
					assert.equal( from, 1 );
					assert.equal( to, 2 );
					done();
				})
				.exec( function ( err, data ) {} );
		});
	});

	describe( '#papersize', function () {
		it( 'should set the paper size', function ( done ) {
			assert.deepEqual( gs().papersize( 'a4' ).options, [ '-sPAPERSIZE=a4' ] );

			done();
		});
	});

	describe( '#quiet / #q', function () {
		it( 'should tell gs to be quiet', function ( done ) {
			assert.deepEqual( gs().q().options, [ '-q' ] );

			done();
		});
	});

	describe( '#reset', function () {
		it( 'should reset gs to initial state', function ( done ) {
			var self = gs().reset();

			assert.deepEqual( self.options, [] );
			assert.equal( self._executablePath, '' );
			assert.equal( self._input, '-' );

			done();
		});
	});

	describe( '#resolution / #res / #r', function () {
		it( 'should set device resolution', function ( done ) {
			assert.deepEqual( gs().res( 240, 72 ).options, [ '-r240x72' ] );

			done();
		});
	});

	describe( '#safer', function () {
		it( 'should set gs to run in safe mode', function ( done ) {
			assert.deepEqual( gs().safer().options, [ '-dSAFER' ] );

			done();
		});
	});

	describe( '#exec', function () {
		it( 'should raise an error for no callback function', function ( done ) {
			assert.throws( function () {
				gs().exec();
			}, Error );

			assert.throws( function () {
				gs().exec( '' );
			}, Error );

			done();
		});

		it( 'should pass an error for no input data', function ( done ) {
			gs()
				.device()
				.output()
				.exec( function ( err, data ) {
					assert.ok( err );
					assert.equal( this._input, '-' );
					assert.equal( err, 'No input data specified' );

					done();
				});
		});

		it( 'should display data from a standard input', function ( done ) {
			var input = fs.readFileSync( './tests/pdfs/sizes.pdf' );

			if ( input ) {

				gs()
					.device()
					.output()
					.exec( input, function ( err, data ) {
						assert.ok( !err );
						assert.equal( this._input, '-' );
						assert.equal( data.toString(), '               Normal\r\n           Envelope\r\n     Landscape\r\n' );

						done();
					});
			}
		});

		it( 'should display data from a file', function ( done ) {
			gs()
				.batch()
				.nopause()
				.device()
				.output()
				.input( './tests/pdfs/sizes.pdf' )
				.exec( function ( err, data ) {
					assert.ok( !err );
					assert.equal( this._input, './tests/pdfs/sizes.pdf' );
					assert.equal( data.toString(), '               Normal\r\n           Envelope\r\n     Landscape\r\n' );

					done();
				});
		});
	});

	describe( 'events', function () {
		it( 'should emit `data` event', function ( done ) {
			gs()
				.q()
				.nodisplay()
				.input( './tests/pdfs/sizes.pdf' )
				.on( 'data', function ( data ) {
					assert.equal( data, 'GS>' );

					done();
				})
				.exec( function ( err, data ) {} );
		});

		it( 'should emit `pages` event', function ( done ) {
			gs()
				.input( './tests/pdfs/sizes.pdf' )
				.output( './test/pdfs/sizes-%d.jpg' )
				.on( 'pages', function ( from, to ) {
					assert.equal( from, 1 );
					assert.equal( to, 3 );

					done();
				})
				.exec( function ( err, data ) {} );
		});

		it( 'should emit `page` event', function ( done ) {
			var count = 0;

			gs()
				.device( 'jpeg' )
				.output( 'tests/sizes-%d.jpg' )
				.batch()
				.nopause()
				.input( './tests/pdfs/sizes.pdf' )
				.on( 'page', function ( page ) {
					if ( page ) count++;
				})
				.on( 'close', function () {
					if ( count == 3 ) done();
				})
				.exec( function ( err, data ) {} );
		});

		after( function ( done ) {
			childProcess.exec( 'rm tests/sizes-*.jpg', function ( err, stdout, stderr ) {
				if ( err ) return done( err );

				done();
			});
		});
	});
});
