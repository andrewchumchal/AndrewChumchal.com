/***
uglify: true
***/

(function(exports, $) {
  "use strict";

  var renderRepoSummary = _.template('<li><h3><i class="fa fa-li <%= icon %>"></i> <a href="<%= html_url %>"><%- name %></a></h3><p><%- description %></p><%= homepage %><p class="muted"><%= events %></p></li>');
  var renderStar = _.template('<li><h3 title="<%- description %>"><i class="fa fa-li fa-star"></i> Starred <a href="<%= html_url %>"><%- name %></a></h3></li>');

  var icon = '<i class="fa <%= icon %>"></i> ';
  var eventTemplates = {
    PushEvent: _.template(icon + '<a href="<%= repo.html_url %>/commits?author=andrewchumchal"><%= events.length %> code push<%= events.length == 1 ? "" : "es"%></a>'),
    CreateEvent: _.template(icon + '<a href="<%= url %>"><%= payload.ref_type || "repo" %> created</a>'),
    IssueCommentEvent: _.template(icon + '<a href="<%= event.payload.issue.html_url %>"><%= events.length %> issue comment<%= events.length == 1 ? "" : "s"%></a>'),
    IssuesEvent: _.template(icon + '<a href="<%= event.payload.issue.html_url %>"><%= events.length %> issue<%= events.length == 1 ? "" : "s"%> created</a>'),
    MemberEvent: _.template(icon + '<a href="<%= repo.html_url %>"><%= events.length %> contributor<%= events.length == 1 ? "" : "s"%> added</a>'),
    PullRequestEvent: _.template(icon + '<a href="<%= event.payload.pull_request.html_url %>"><%= events.length %> pull request<%= events.length == 1 ? "" : "s"%></a>'),
    WatchEvent: _.template(icon + '<a href="<%= repo.html_url %>">Starred</a>'),
    ForkEvent: _.template(icon + '<a href="<%= event.payload.forkee.html_url %>">forked repo</a>'),
    DeleteEvent: _.template(icon + '<%= payload.ref_type || "repo" %> deleted'),
        'default':  _.template(icon + '<a href="<%= repo.html_url %>"><%= events.length %> <%= events[0].type.replace(/([A-Z])/g, " $1").toLowerCase() %><%= events.length == 1 ? "" : "s"%></a>')
  };

  var eventIcons = {
    CreateEvent: 'fa-code-fork',
    PushEvent: 'fa-upload', // 'fa-circle-arrow-up',
    ForkEvent: 'fa-code-fork',
    //GistEvent: 'fa-file-o',
    IssuesEvent: 'fa-bug',
    IssueCommentEvent: 'fa-comment-o',
    PullRequestEvent: 'fa-wrench',
    PullRequestReviewCommentEvent: 'fa-comment',
    WatchEvent: 'fa-star',
    FollowEvent: 'fa-plane',
    MemberEvent: 'fa-user',
    DeleteEvent: 'fa-trash',
    'default':  'fa-gears'
  
    // todo: fa-check  for issue closed
  };
  
  var repoIcons = {
    'andrewchumchal.com': 'fa-home',
    'Windows-Registry-Tweaks': 'fa-windows',
    'Chapocalypse': 'fa-paw',
  };

  function handleGH(response) {
    var $list = $('div.github ul');
    $list.empty();
  
    function eventType(event) { 
      return event.type;
    }
    function renderSumary(events, type) {
      var et = eventTemplates,
        repo = repos[events[0].repo.name],
        payload = events[0].payload || {},
        data = {
                    repo: repo,
          events: events,
                    event: events[0],
          icon: eventIcons[type] || eventIcons['default'],
          payload: payload,
          url: repo.html_url + (payload.ref_type === 'branch' || payload.ref_type === 'tag' ? '/tree/' + payload.ref : '' )
        };
      return et[type] ? et[type](data) : et['default'](data);
    }
  
     var eventsByRepo = _.chain(response.data).filter(function(event ){
      // filter out events that aren't attached to a repo
      return event.repo;
     }).filter(function(event) {
      // remove Chapocalypse-Standalones stuff
      return !(event.payload && event.payload.ref && event.payload.ref.substr(0,11) === 'Chapocalypse-Standalones');
     }).groupBy(function(event) {
       // group the events by repo name
       return event.repo.name;
     }).value();

    var repos = {};

    var repoRequests = _.map(eventsByRepo, function(events, name){
      return new Promise(function(resolve, reject) {
        $.getJSON(events[0].repo.url).then(function(data) {
          repos[name] = data;
          resolve(data);
        }).fail(function(e) {
          console.log('failure retrieving details for '+ name +' :'+ e.status +' '+ e.statusText +'\n'+ e.responseText);
          delete eventsByRepo[name];
          resolve(); // resolve, not reject so that $.when still works.
        });
      });
    });

    Promise.all(repoRequests).then(function() {

      _(eventsByRepo).chain().map(function(repoEvents) {
        // sub-group the events by eventType
        return _.groupBy(repoEvents, eventType);
      }).map(function(repoEvents, name) {
        // extract the repo data and render a summary of the events
        var repoName = _.values(repoEvents)[0][0].repo.name;
        var repo = repos[repoName];
        repo.starredOnly = (_.keys(repoEvents).length == 1 && repoEvents.WatchEvent);
        repo.events = _.chain(repoEvents).map(renderSumary).toArray().value().reverse().join(', ');
        var eventType = _.keys(repoEvents)[0];
        repo.icon = repoIcons[repo.name] || eventIcons[eventType] || eventIcons['default'];
        repo.homepage = repo.homepage ? '<p class="home"><a href="' + repo.homepage + '">' + repo.homepage + '</a></p>' : '';
        return repo;
      }).each(function(repo) {
        // render a <li> for each repo that includes the summary from the previous step
        // now we have to request repo.url to get name & description...
        var html = repo.starredOnly ? renderStar(repo) : renderRepoSummary(repo);
        $(html).appendTo($list);
      });
    });

  }

  $(document).ready(function() {
    $.getScript('https://api.github.com/users/andrewchumchal/events?callback=handleGH');
  });

  exports.handleGH = handleGH;
})(window, jQuery);
