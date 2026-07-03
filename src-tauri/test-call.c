#include <stdio.h>
#include <windows.h>
typedef int (*start_fn)(const char*,int,const char*,void*,void*,void*);
typedef void (*stop_fn)();
static void on_frame(int w,int h,const unsigned char*d,int s,void*u){printf("[cb] frame %dx%d\n",w,h);}
static void on_status(const char*m,void*u){printf("[cb] status: %s\n",m);}
int main(){
    HMODULE dll=LoadLibraryA("spice-bridge.dll");
    start_fn s=(start_fn)GetProcAddress(dll,"spice_start");
    stop_fn st=(stop_fn)GetProcAddress(dll,"spice_stop");
    printf("calling...\n");fflush(stdout);
    int r=s("192.168.201.131",5900,NULL,on_frame,on_status,NULL);
    printf("start=%d\n",r);fflush(stdout);
    for(int i=0;i<20;i++){Sleep(1000);printf(".");fflush(stdout);}
    printf("\nstop\n");fflush(stdout);
    st();FreeLibrary(dll);
    return 0;
}
