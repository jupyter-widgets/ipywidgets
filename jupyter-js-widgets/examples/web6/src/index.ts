import * as CodeMirror from 'codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/mode/python/python';
import * as request from 'browser-request';
import * as startsWith from 'lodash.startswith';
import { WidgetManager } from './manager';
import { Kernel } from '@jupyterlab/services';

var apiServer = "http://beta.mybinder.org";
var displayName = "jovyan/pythreejs";
var templateName = displayName.replace('/tree', '').replace(/\//g, '-').toLowerCase();

request({
  url: apiServer + '/api/deploy/' + templateName,
  json: true
}, function (err, res, json) {
  if (err) {
    console.log(err);
  }
  request({
    url: apiServer + '/api/apps/' + templateName + '/' + json['id'],
    json: true
  }, function (err, res, json) {
    var location  = json['location'];
    var status = json['status'];
    if (location) {
      if (!startsWith(location, 'http://')) {
        location = 'http://' + location;
      }
      console.log('success');
      //window.location.href = location + deepLink;
    } else if (status === 'failed') {
      console.log('error');
    }
  });
});



