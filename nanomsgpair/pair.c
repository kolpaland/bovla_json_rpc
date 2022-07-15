#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>

#include <nanomsg/nn.h>
#include <nanomsg/pair.h>

#define NODE0 "node0"
#define NODE1 "node1"

void
fatal(const char *func)
{
        fprintf(stderr, "%s: %s\n", func, nn_strerror(nn_errno()));
        exit(1);
}

int
send_cmd(int sock)
{
        char * buf= "{\"jsonrpc\": \"2.0\", \"result\": { \"states\": 0, \"prm\": [[ 1, 0, 0],[ 0, 0, 1],[ 0, 0, 0]], \"prd\": [ 0, 0 ], \"gh\": 0, \"nrz\": 1}, \"id\": 1}";

        printf("%s: SENDING \"%s\"\n", NODE0, buf);
        int sz_n = strlen(buf); // '\0' too
        return (nn_send(sock, buf, sz_n, 0));
}

int
recv_cmd(int sock)
{
        char *buf = NULL;
        int result = nn_recv(sock, &buf, NN_MSG, 0);
        if (result > 0) {
                printf("%s: RECEIVED \"%s\"\n", NODE0, buf); 
                if(strstr(buf, "id\":1"))
                        send_cmd(sock);                
                nn_freemsg(buf);
        }
        return (result);
}

int
send_recv(int sock)
{
        int to = 100;
        if (nn_setsockopt(sock, NN_SOL_SOCKET, NN_RCVTIMEO, &to,
            sizeof (to)) < 0) {
                fatal("nn_setsockopt");
        }

        for (;;) {
                recv_cmd(sock);
                sleep(1);                
        }
}

int
node0(const char *url)
{
        int sock;
        if ((sock = nn_socket(AF_SP, NN_PAIR)) < 0) {
                fatal("nn_socket");
        }
         if (nn_bind(sock, url) < 0) {
                fatal("nn_bind");
        }
        return (send_recv(sock));
}

int
main(const int argc, const char **argv)
{
        if ((argc > 1) && (strcmp(NODE0, argv[1]) == 0))
                return (node0(argv[2]));

        fprintf(stderr, "Usage: pair %s <URL> <ARG> ...\n", NODE0);
        return 1;
}