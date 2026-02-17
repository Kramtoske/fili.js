
BIN = ./node_modules/.bin
BROWSERIFY = $(BIN)/browserify
UGLIFY = $(BIN)/uglifyjs
STANDARD = $(BIN)/standard

build:
	$(BROWSERIFY) ./index.js \
	--standalone Fili \
	-t [babelify] \
	-t [envify --NODE_ENV production] \
	-p [bannerify --file ./banner.txt] \
	-o ./dist/fili.js
	$(UGLIFY) ./dist/fili.js --compress --mangle --comments -o ./dist/fili.min.js

sbom:
	npm run sbom

test:
	npm test

server:
	python -m SimpleHTTPServer 8080

ghpages:
	git checkout gh-pages
	git checkout master demo/
	cp demo/src.js src.js
	cp demo/styles.css styles.css
	cp demo/index.html index.html
	cp demo/d3draw.js d3draw.js
	rm -rf demo/
	git add . --all
	git commit -m "update gh-pages"
	git push
	git checkout master

standard:
	$(STANDARD)

.PHONY: test build sbom beautify ghpages standard
