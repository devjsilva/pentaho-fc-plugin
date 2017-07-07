define([
      'cdf/lib/jquery',
      'amd!cdf/lib/underscore',
      'cdf/Dashboard.Bootstrap',
      'cdf/Logger'
    ], function($, _, Dashboard, Logger) {

      var sparkl = {

        _settings: {
          expressions: {
            element: /^[A-Za-z][A-Za-z\d]*$/,
            plugin: /^[A-Za-z][A-Za-z\d]*$/,
            image: /\.(png|jpg)$/,
            zip: /\.(zip)$/
          },
          reservedNames: [
            'status', 'refresh', 'reload'
          ]
        },

        getSettings: function() {
          var acc = _settings;
          _.every(arguments, function(el) {
            acc = acc[el] || undefined;
            return !!acc
          });
          return acc;
        },


        changeLocation: function(newLocation, bookmarks, isNew) {
          if (!newLocation) {
            return;
          }
          var hash = (bookmarks && !_.isEmpty(bookmarks)) ? '#' + generateHashValue("bookmark", {
            impl: "client",
            params: bookmarks
          }) : "";
          if (isNew) {
            window.open(newLocation + hash);
          } else {
            window.location = newLocation + hash;
          }
        },

        generateHashValue: function(key, value) {
          var obj = window.Dashboard.getHashValue(),
            json;
          if (arguments.length == 1) {
            obj = key;
          } else {
            obj[key] = value;
          }
          json = JSON.stringify(obj);
          return json;
        },

        isValidName: function(name, type) {
          var reg = _settings.expressions[type || 'plugin'] || /.*/;
          return reg.test(name);
        },


        isUpdated: function(srcVersion, pluginVersion) {
          return (srcVersion == pluginVersion);
        },


        isJobError: function(json) {
          return (json && json.result === false);
        },



        createElementsTableEmptyRawData: function() {
          var emptyData = {
            metadata: [{
                colIndex: 0,
                colType: 'String',
                colName: 'elementName'
              },
              {
                colIndex: 1,
                colType: 'String',
                colName: 'elementType'
              },
              {
                colIndex: 2,
                colType: 'Boolean',
                colName: 'adminOnly'
              },
              {
                colIndex: 3,
                colType: 'String',
                colName: 'fileName'
              },
              {
                colIndex: 4,
                colType: 'String',
                colName: 'elementName'
              }
            ],
            queryInfo: {
              totalRows: 0
            },
            resultset: []
          }
          return emptyData;
        },


        runEndpoint: function(pluginId, endpoint, opts) {

          if (!pluginId && !endpoint) {
            console.log('PluginId or endpointName not defined.');
            return false
          }

          var _opts = {
            success: function() {
              console.log(pluginId + ': ' + endpoint + ' ran successfully.')
            },
            error: function() {
              console.log(pluginId + ': error running ' + endpoint + '.')
            },
            params: {},
            systemParams: {},
            type: 'POST',
            dataType: 'json'
          }
          var opts = $.extend({}, _opts, opts);
          var path = window.location.pathname.split('/');
  				var url = window.location.origin + "/" + path[1] + '/plugin/' + pluginId + '/api/' + endpoint;
          //var url = window.Dashboard.getWebAppPath() + '/plugin/' + pluginId + '/api/' + endpoint;

          function successHandler(json) {
            if (json && json.result == false) {
              opts.error.apply(this, arguments);
            } else {
              opts.success.apply(this, arguments);
            }
          }

          function errorHandler() {
            opts.error.apply(this, arguments);
          }
          if (endpoint != 'renderer/refresh') { //XXX - do this better
            var ajaxOpts = {
              url: url,
              async: true,
              type: opts.type,
              dataType: opts.dataType,
              success: successHandler,
              error: errorHandler,
              data: {}
            }
          } else {
            var ajaxOpts = {
              url: url,
              async: true,
              type: 'GET',
              dataType: opts.dataType,
              success: successHandler,
              error: errorHandler,
              data: {}
            }
          }

          _.each(opts.params, function(value, key) {
            ajaxOpts.data['param' + key] = value;
          });
          _.each(opts.systemParams, function(value, key) {
            ajaxOpts.data[key] = value;
          });

          $.ajax(ajaxOpts)
        },

        getEndpointCaller: function(pluginId, endpoint, opts) {
          var myself = this;
          return function(callback, errorCallback, params) {
            var _opts = $.extend({}, opts);
            _opts.params = params || _opts.params;
            _opts.success = callback || _opts.success;
            _opts.error = errorCallback || _opts.error;
            myself.runEndpoint(pluginId, endpoint, _opts);
          }
        }
      };

      return sparkl
    });
