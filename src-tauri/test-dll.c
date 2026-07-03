/* 直接测试 spice-bridge.dll */
#include <stdio.h>
#include <windows.h>

typedef int (*start_fn)(const char*, int, const char*, void*, void*, void*);
typedef void (*stop_fn)();

static void on_frame(int w, int h, const unsigned char *data, int size, void *user) {
    printf("[cb] frame: %dx%d %d bytes\n", w, h, size);
}

static void on_status(const char *msg, void *user) {
    printf("[cb] status: %s\n", msg);
}

int main() {
    HMODULE dll = LoadLibraryA("spice-bridge.dll");
    if (!dll) { printf("LoadLibrary failed\n"); return 1; }
    printf("DLL loaded\n");

    start_fn start = (start_fn)GetProcAddress(dll, "spice_start");
    stop_fn stop = (stop_fn)GetProcAddress(dll, "spice_stop");
    if (!start || !stop) { printf("GetProcAddress failed\n"); return 1; }
    printf("Functions loaded\n");

    int ret = start("192.168.201.131", 5900, NULL, on_frame, on_status, NULL);
    printf("spice_start returned: %d\n", ret);

    if (ret == 0) {
        printf("Waiting 10 seconds...\n");
        Sleep(10000);
        printf("Stopping...\n");
        stop();
    }
    printf("Done\n");
    FreeLibrary(dll);
    return 0;
}
