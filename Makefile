
build: components index.js
	@component build --dev

components: component.json
	@component install --dev

clean:
	rm -fr build components template.js

test: lint test-only coverage

lint:
	@jshint --verbose *.js *.json

test-only:
	@mocha -R spec

coverage:
	@mocha -r blanket -R html-cov > coverage.html
	@open coverage.html

.PHONY: clean test coverage lint test-only
