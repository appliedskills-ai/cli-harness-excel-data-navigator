# Makefile — thin composition root. Only the include chain, aggregators, and help.

include Makefile.vars
-include Makefile.lang.node

install: node.install ## install all dependencies
test: node.test ## run all tests

help: ## list available targets
	@grep -hE '^[a-zA-Z0-9_.-]+:.*## ' $(MAKEFILE_LIST) \
	  | sort \
	  | awk 'BEGIN{FS=":.*## "}{printf "  %-16s %s\n", $$1, $$2}'

.PHONY: install test help
