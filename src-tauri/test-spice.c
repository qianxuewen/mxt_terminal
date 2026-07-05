/**
 * test-spice.c - 独立测试程序，不经过 Rust/Tauri
 * 编译: gcc -o test-spice.exe test-spice.c $(pkg-config --cflags --libs spice-client-glib-2.0 gio-2.0) -Wno-deprecated-declarations
 */
#include <stdio.h>
#include <stdlib.h>
#include <glib.h>
#include <spice-client.h>

int main(int argc, char **argv) {
    const char *host = "192.168.201.131";
    int port = 5900;

    printf("[test] Starting...\n");
    fflush(stdout);

    SpiceSession *session = spice_session_new();
    printf("[test] session=%p\n", (void*)session);
    fflush(stdout);

    if (!session) {
        printf("[test] FAILED: spice_session_new returned NULL\n");
        return 1;
    }

    g_object_set(session, "host", host, "port", port, NULL);
    printf("[test] host/port set\n");
    fflush(stdout);

    /* 连接 channel-new 信号 */
    g_signal_connect(session, "channel-new", G_CALLBACK(+{
        printf("[test] channel-new signal\n");
        fflush(stdout);
    }), NULL);

    printf("[test] Connecting...\n");
    fflush(stdout);

    spice_session_connect(session);
    printf("[test] connect initiated, waiting 5s...\n");
    fflush(stdout);

    /* 等 5 秒看是否有信号 */
    GMainLoop *loop = g_main_loop_new(NULL, FALSE);
    g_timeout_add_seconds(5, +{
        printf("[test] 5s timeout, quitting\n");
        fflush(stdout);
        g_main_loop_quit(NULL);
        return FALSE;
    }, NULL);
    g_main_loop_run(loop);

    printf("[test] Done\n");
    spice_session_disconnect(session);
    g_object_unref(session);
    return 0;
}
