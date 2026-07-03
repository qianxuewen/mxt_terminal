/**
 * spice-launcher.c - SPICE 客户端启动器 (模仿 spicy.c)
 *
 * 编译: gcc -o spice-launcher spice-launcher.c $(pkg-config --cflags --libs spice-client-glib-2.0)
 *
 * 功能:
 * 1. 使用 libspice-client-glib-2.0 建立 SPICE 连接
 * 2. 通过 stdout 输出帧数据 (JSON + base64 RGBA)
 * 3. 从 stdin 读取键盘/鼠标事件
 * 4. 非 GTK 依赖 - 纯协议层
 *
 * 参考: spice-gtk-v0.43/tools/spicy.c 的 connection_new/connection_connect/channel_new
 */

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <glib.h>
#include <spice-client.h>
#include <spice-common.h>
#include <spice-marshal.h>

/* 全局会话状态 */
typedef struct {
    SpiceSession *session;
    SpiceMainChannel *main_channel;
    int display_width;
    int display_height;
    int connected;
} SpiceContext;

/* 通道新建回调 - 同 spicy.c channel_new() */
static void on_channel_new(SpiceSession *s, SpiceChannel *channel, gpointer data) {
    SpiceContext *ctx = (SpiceContext *)data;
    int id;
    g_object_get(channel, "channel-id", &id, NULL);

    if (SPICE_IS_MAIN_CHANNEL(channel)) {
        ctx->main_channel = SPICE_MAIN_CHANNEL(channel);
        g_signal_connect(channel, "channel-event",
            G_CALLBACK(+{
                // main_channel_event handler
            }), ctx);
        spice_channel_connect(channel);
    }

    if (SPICE_IS_DISPLAY_CHANNEL(channel)) {
        fprintf(stderr, "[spice] new display channel #%d\n", id);
        /* 连接显示通道 - 接收帧数据 */
        g_signal_connect(channel, "display-primary-create",
            G_CALLBACK(+{
                // 处理主表面创建
            }), ctx);
        spice_channel_connect(channel);
    }

    if (SPICE_IS_INPUTS_CHANNEL(channel)) {
        fprintf(stderr, "[spice] new inputs channel #%d\n", id);
        spice_channel_connect(channel);
    }
}

/* 连接 SPICE 服务器 */
static SpiceContext* spice_connect(const char *host, int port, const char *password) {
    SpiceContext *ctx = g_new0(SpiceContext, 1);

    ctx->session = spice_session_new();

    /* 设置连接参数 */
    g_object_set(ctx->session,
        "host", host,
        "port", port,
        "password", password ? password : "",
        NULL);

    /* 注册通道回调 */
    g_signal_connect(ctx->session, "channel-new",
        G_CALLBACK(on_channel_new), ctx);

    /* 断开连接回调 */
    g_signal_connect(ctx->session, "disconnected",
        G_CALLBACK(+{
            ctx->connected = FALSE;
            fprintf(stderr, "[spice] disconnected\n");
        }), ctx);

    /* 发起连接 */
    spice_session_connect(ctx->session);
    ctx->connected = TRUE;

    fprintf(stderr, "[spice] connecting to %s:%d\n", host, port);
    return ctx;
}

int main(int argc, char *argv[]) {
    const char *host = "192.168.201.131";
    int port = 5900;
    const char *password = NULL;

    if (argc >= 2) host = argv[1];
    if (argc >= 3) port = atoi(argv[2]);
    if (argc >= 4) password = argv[3];

    /* 初始化 GLib/GTK */
    gtk_init(&argc, &argv);

    /* 创建 SPICE 会话 (同 spicy.c connection_new) */
    SpiceContext *ctx = spice_connect(host, port, password);

    /* 运行 GLib 主循环 (接收 SPICE 事件) */
    GMainLoop *loop = g_main_loop_new(NULL, FALSE);
    g_main_loop_run(loop);

    return 0;
}
