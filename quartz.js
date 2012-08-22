window.Quartz = {
	format: function( str ) {
		var len = str.length;
		var ret = '';

		for( var ii = 0; ii < len; ++ii )
			ret += ( this._format[ str[ii] ] != undefined
				? this._format[ str[ii] ]()
				: str[ii] );

		return ret;
	},

	reset: function() {
		this._d = new Date();
		this._date = this._day = this._week = this._month = this._year = null;
		this._hour = this._min = this._sec = this._milli = this._time = null;

		return this;
	},

	modify: function( str ) {
		// search for relative statements like:
		// +/- x week(s), last/next month, x week(s) ago
		var m = /(\+?\d*|\-\d*|next|last)?\s+(day|week|month|year)s?\s?(ago)*/gi
			.exec( str );
		m.splice( 0, 1 );

		// test if the relative time is numeric
		var num = /(\-|\+)?\d+/.test( m[0] );

		if( m[0] == 'next' || num || m[0] == 'last' ) {
			// reset everything so day/month/year/etc doesn't return cached values
			this.reset();

			var rel = ( num ? parseInt( m[0] ) : 1 );

			if( m[0] == 'last' )
				rel = -1;

			// if ago is found, make rel negative so it is subtracted
			if( m[2] == 'ago' )
				rel = -rel;

			// calling the native "get" methods because calling .month(), etc
			// was causing the _month, etc to get cached and not work properly
			if( m[1] == 'day' )
				Quartz.d().setDate( Quartz.d.getDate() + rel );
			else if( m[1] == 'month' )
				Quartz.d().setMonth( Quartz.d().getMonth() + rel );
			else if( m[1] == 'week' )
				// no use calculating 7*24*60*60*1000 every time;
				// 604800000 = 1 week in milliseconds
				Quartz.d().setTime( Quartz.d().getTime() + ( 604800000 * rel ) );
			else if( m[1] == 'year' )
				Quartz.d().setFullYear( Quartz.d().getFullYear() + rel );

		}

		return this;
	},

	// zero pad numbers less than 10
	zero: function( num ) {
		return ( num < 10 ? '0' + num : num );
	},

	// collection of functions to calculate and return date formats
	_format: {
		// Lowercase Ante meridiem and Post meridiem
		a: function() {
			return ( Quartz.hour() > 11
				? 'pm' : 'am' );
		},

		// Uppercase Ante meridiem and Post meridiem
		A: function() {
			return ( Quartz.hour() > 11
				? 'pm' : 'am' ).toUpperCase();
		},

		// A textual representation of a day, three letters
		D: function() {
			return [ 'Sun', 'Mon', 'Tue', 'Wed', 'Thu',
				'Fri', 'Sat' ][ Quartz.day() ];
		},

		// Day of the month, 2 digits with leading zeros
		d: function() {
			return Quartz.zero( Quartz.date() );
		},

		// A full textual representation of a month, such as January or March
		F: function() {
			return [ 'January', 'February', 'March', 'April', 'May', 'June',
				'July', 'August', 'September', 'October', 'November',
				'December' ][ Quartz.month() ];
		},

		// 24-hour format of an hour without leading zeros
		G: function() {
			return Quartz.hour();
		},

		// 12-hour format of an hour without leading zeros
		g: function() {
			var h = Quartz.hour();
			return ( h > 12 ? h -= 12 : h );
		},

		// 24-hour format of an hour with leading zeros
		H: function() {
			return Quartz.zero( Quartz.hour() );
		},

		// 12-hour format of an hour with leading zeros
		h: function() {
			var h = Quartz.hour();
			return ( h > 12 ? h -= 12 : Quartz.zero( h ) );
		},

		// Minutes with leading zeros
		i: function() {
			return Quartz.zero( Quartz.min() );
		},

		// Day of the month without leading zeros
		j: function() {
			return Quartz.date();
		},

		// Whether it's a leap year
		L: function() {
			var y = Quartz.year();
			if( y % 4 == 0)
				return ( y % 100 == 0 ? year % 400 == 0 : 1 );
			else
				return 0;
		},

		// A full textual representation of the day of the week
		l: function() {
			return [ 'Sunday', 'Monday', 'Tuesday', 'Wednesday',
				'Thursday', 'Friday', 'Saturday' ][ Quartz.day() ];
		},

		// A short textual representation of a month, three letters
		M: function() {
			return [ 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul',
				'Aug', 'Sep', 'Oct', 'Nov', 'Dec' ][ Quartz.month() ];
		},

		// Numeric representation of a month, with leading zeros
		m: function() {
			// month + 1, js returns month - 1; jan = 0 - dec = 11
			return Quartz.zero( Quartz.month() + 1 );
		},

		//Numeric representation of a month, without leading zeros
		n: function() {
			// month + 1, js returns month - 1; jan = 0 - dec = 11
			return Quartz.month() + 1;
		},

		// RFC 1123 formatted date
		r: function() {
			return Quartz.d().toUTCString();
		},

		// English ordinal suffix for the day of the month, 2 characters
		S: function() {
			var j = Quartz.d();
			if( j >= 11 && j <= 13 )
				return "th";

			switch( j % 10 ) {
				case 1:  return "st";
				case 2:  return "nd";
				case 3:  return "rd";
				default: return "th";
			}
		},

		// Seconds, with leading zeros
		s: function() {
			return Quartz.zero( Quartz.sec() );
		},

		// Milliseconds
		u: function() {
			return Quartz.milli();
		},

		// ISO-8601 week number of year, weeks starting on Monday
		W: function() {
			var d = new Date( Quartz.year(), 0, 1 );
			d = Math.ceil( ( Quartz.d() - d ) / 86400000 );
			d += Quartz.date();
			d -= Quartz.day() + 10;
			return Math.floor( d / 7 );
		},

		// Numeric representation of the day of the week
		w: function() {
			return Quartz.day();
		},

		// A full numeric representation of a year, 4 digits
		Y: function() {
			return Quartz.year();
		},

		// A two digit representation of a year
		y: function() {
			return parseInt( Quartz.year().toString().substr(-2) );
		},

		// The day of the year (starting from 0)
		z: function() {
			var f = new Date( Quartz.year(), 0, 1 );
			return Math.ceil( ( Quartz.d() - f ) / 86400000 );
		}
	},

	/**
	 * CACHE SECTION ***********************************************************
	 * here be lizards... changing below this line could break things, careful
	 */

	_d: null,
	_date: null,
	_day: null,
	_week: null,
	_month: null,
	_hour: null,
	_min: null,
	_sec: null,
	_milli: null,
	_year: null,
	_time: null,

	d: function() {
		if( ! this._d )
			this._d = new Date();
		return this._d;
	},

	date: function() {
		if( ! this._date )
			this._date = this.d().getDate();;
		return this._date;
	},

	hour: function() {
		if( ! this._hour )
			this._hour = this.d().getHours();
		return this._hour;
	},

	min: function() {
		if( ! this._min )
			this._min = this.d().getMinutes();
		return this._min;
	},

	sec: function() {
		if( ! this._sec )
			this._sec = this.d().getSeconds();
		return this._sec;
	},

	milli: function() {
		if( ! this._milli )
			this._milli = this.d().getMilliseconds();
		return this._milli;
	},

	month: function() {
		if( ! this._month )
			// use caution, js returns (month - 1): jan = 0, dec = 11
			this._month = this.d().getMonth();
		return this._month;
	},

	year: function() {
		if( ! this._year )
			this._year = this.d().getFullYear();
		return this._year;
	},

	day: function() {
		if( ! this._day )
			this._day = this.d().getDay();
		return this._day;
	},

	time: function() {
		if( ! this._time )
			this._time = this.d().getTime();
		return this._time;
	}
};