mdx = ./node_modules/.bin/mdx --markdown -x internal 

# Use mdx to update readme.md
update: README.md
README.md: scour.js utilities/index.js
	(sed '/<!--api-->/q' $@; echo; ${mdx} $^; sed -n '/<!--api:end-->/,$$p' $@) > $@~
	mv $@~ $@
