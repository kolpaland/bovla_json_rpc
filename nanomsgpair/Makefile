PROG ?= pair
ARGS ?= node0 ws://127.0.0.1:64999


all: $(PROG)
	$(DEBUGGER) ./$(PROG) $(ARGS)

$(PROG): pair.c
	$(CC) pair.c -W -Wall -DMG_ENABLE_LINES=1 $(CFLAGS) -lnanomsg -o $(PROG)

clean:
	rm -rf $(PROG) *.o *.dSYM *.gcov *.gcno *.gcda *.obj *.exe *.ilk *.pdb
