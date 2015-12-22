# Use mdx to update readme.md
update: README.md
README.md: scour.js
	( sed '/<!--api-->/q' $@; \
		echo; \
		./node_modules/.bin/mdx $^ --format markdown -x internal; \
		sed -n '/<!--api:end-->/,$$p' $@ ) > .$@
	@mv .$@ $@
