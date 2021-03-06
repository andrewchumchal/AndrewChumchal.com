# DocPad Configuration File
# http://docpad.org/docs/config
notIndex = (model, cleanedSearchString) ->
	model.get("filename").substr(0, 6) isnt "index."
_ = require("underscore")
path = require("path")
reImages = /<img [^>]+>/g
reHW = /(height|width)="\d+"/g
reClass = /class="[^"]+"/
reHeadings = /<h\d>(.*)<\/h\d>/g
reLinks = /<a[^>]+>|<\/a>/g
module.exports =

	# the default worked great until I went from 178 to 267 files by adding my "stuff" directory.
	# I might yet try and move it off site.
	# Until then, this makes dp run locally without hanging on "Watching setup starting..."
	watchOptions:
		preferredMethods: [
			"watchFile"
			"watch"
		]

	plugins:
		ghpages:
			quiet: true

		thumbnails:
			imageMagick: true

		sitemap:
			cachetime: 600000
			changefreq: "monthly"
			priority: 0.5
			hostname: "https://www.gh.andrewchumchal.com"

		redirector:
			redirects:
				"/files/Andrew-Chumchal-Resume.pdf": "http://gh.andrewchumchal.com/Andrew-Chumchal-Resume.pdf"

		cleanurls:
			trailingSlashes: true # this is to avoid having github pages redirect users from the cloudfront domain to the github domain just to add the slash to the end of the url.

		jshint:
			ignorePaths: ['scripts/lightbox/', 'stuff/jquery-requirejs-noconflict-issue', 'bower_components/']

	templateData:
		activeAttrIf: (menuSection) ->
			'class="active"' if @document.section is menuSection

		getFirstImage: (post) ->
			images = post.contentRenderedWithoutLayouts.match(reImages)
			return ""  unless images
			img = images[0]
			img.replace(reHW, "").replace reClass, ""

		getPreview: (post) ->
			return ""  unless post.contentRenderedWithoutLayouts
			sections = post.contentRenderedWithoutLayouts.split("<!--more-->")
			return ""  unless sections.length is 2
			sections[0].replace reHeadings, "<p>$1</p>"

		getStrippedPreview: (post) ->
			@getPreview(post).replace(reLinks, "").replace reImages, ""

		linkTags: (tags) ->
			self = this
			_(tags).map((tag) ->
				"<a href=\"#" + self.normalizeTag(tag) + "\">" + tag + "</a>"
			).join ", "

		normalizeTag: (tag) ->
			tag.toLowerCase().replace('++', 'pp').replace('#', '-sharp').replace(/[^a-z0-9]/g, " ").trim().replace RegExp(" +", "g"), "-"

		linkPhotoCredits: (links) ->
			# turn the object into an array
			# end the chain and get a regular array back
			_.chain(links).map((url, text) ->
				"<a href=\"" + url + "\">" + text + "</a>"
			).values().value().join ", "

		site:
			url: "https://www.gh.andrewchumchal.com"

#
#			posts.renderPreviews = function() {
#				posts.each(function(post) {
#					post.getOutContent();
#					console.dir(post);
#					var sections = post.contentRenderedWithoutLayouts.split('<!--more-->');
#					console.log(sections.length);
#					var preview = (sections.length != 2) ? preview = "" : sections[0]; //.replace(reImages, '');
#					post.set('preview', preview);
#				});
#				return posts;
#			}
#			return posts;
#
