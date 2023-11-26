PROGRAM ?= git-mux
PREFIX ?= /usr
DOCPREFIX ?= $(PREFIX)/share/doc/$(PROGRAM)
MANDIR ?= man/man1

all: man format lint
	echo Run \'sudo make install\' to install $(PROGRAM).

man: docs/$(PROGRAM).1.txt
	mkdir -p bin/$(MANDIR)
	pandoc --standalone --from markdown-smart --to man $< --output bin/$(MANDIR)/$(PROGRAM).1
	pandoc --standalone --from markdown-smart --to gfm $< --output docs/MANUAL.md
	sed -i 's%\*\$$%*\\$$%g' docs/MANUAL.md
	sed -i 's%\*ENVIRONMENT\*%[ENVIRONMENT](#environment)%g' docs/MANUAL.md
	sed -i 's%^#%##%g' docs/MANUAL.md

install:
	mkdir -p $(DESTDIR)$(PREFIX)/bin
	mkdir -p $(DESTDIR)$(PREFIX)/share/$(MANDIR)
	mkdir -p $(DESTDIR)$(DOCPREFIX)
	cp -p bin/$(PROGRAM) $(DESTDIR)$(PREFIX)/bin
	cp -p bin/$(MANDIR)/$(PROGRAM).1 $(DESTDIR)$(PREFIX)/share/$(MANDIR)
	cp -p README.md $(DESTDIR)$(DOCPREFIX)
	cp -p docs/MANUAL.md $(DESTDIR)$(DOCPREFIX)
	chmod 755 $(DESTDIR)$(PREFIX)/bin/$(PROGRAM)
	echo Install successful. Run \'sudo make uninstall\' to uninstall $(PROGRAM).

uninstall:
	rm -f $(DESTDIR)$(PREFIX)/bin/$(PROGRAM)
	rm -f $(DESTDIR)$(PREFIX)/share/$(MANDIR)/$(PROGRAM).1
	rm -rf $(DESTDIR)$(DOCPREFIX)

lint:
	# https://github.com/koalaman/shellcheck
	command -v shellcheck >/dev/null 2>&1 && \
		shellcheck bin/$(PROGRAM)
	# https://github.com/igorshubovych/markdownlint-cli
	command -v markdownlint >/dev/null 2>&1 && \
		markdownlint .

format: man
	# https://github.com/prettier/prettier
	command -v prettier >/dev/null 2>&1 && \
		prettier --write .
	# https://github.com/mvdan/sh
	command -v shfmt >/dev/null 2>&1 && \
		shfmt --posix --indent 4 --case-indent --write bin/$(PROGRAM)
	# fix some shellcheck issues by piping its diff format to git apply
	 command -v shellcheck >/dev/null 2>&1 && \
		shellcheck --format=diff bin/$(PROGRAM) | git apply --allow-empty
	# fix some markdownlint issues
	command -v markdownlint >/dev/null 2>&1 && \
		markdownlint . --fix --dot >/dev/null 2>&1 || true

changelog:
	# https://github.com/conventional-changelog/conventional-changelog
	conventional-changelog --preset conventionalcommits --infile CHANGELOG.md --same-file

.PHONY: all install uninstall lint format changelog
