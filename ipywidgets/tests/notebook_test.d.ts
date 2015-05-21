// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

/// <reference path="typings/tsd.d.ts" />

declare var IPython: any;
declare var define: any;
declare var casper: Casper;

// For SlimerJS detection.
declare var InstallTrigger: any;

interface Window { 
	pending_msgs: any; 
	_logged_error: any[][];
}
