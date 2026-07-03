#include <stdio.h>
#include <windows.h>
int main() {
    fprintf(stderr, "Loading...\n");
    HMODULE dll = LoadLibraryA("spice-bridge.dll");
    fprintf(stderr, "LoadLibrary: %p\n", (void*)dll);
    if (dll) FreeLibrary(dll);
    fprintf(stderr, "Done\n");
    return 0;
}
