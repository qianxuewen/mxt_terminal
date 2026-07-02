#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <glib.h>
#include <spice-client.h>

/* 回调 */
typedef void (*f_cb)(int w,int h,const unsigned char*d,int s,void*u);
typedef void (*s_cb)(const char*m,void*u);

/* 全局 (进程周期) */
static SpiceSession *g_session=NULL;
static GMainLoop *g_loop=NULL;
static SpiceChannel *g_inputs=NULL;
static GThread *g_thread=NULL;
static volatile int g_quit=0;
static f_cb g_on_frame=NULL;
static s_cb g_on_status=NULL;
static void *g_userdata=NULL;

static void log_s(const char *m){fprintf(stderr,"[spice] %s\n",m);if(g_on_status)g_on_status(m,g_userdata);}

static void cap(SpiceChannel*ch){
    SpiceDisplayPrimary p={0};
    if(!spice_display_channel_get_primary(ch,0,&p)||!p.data||p.width<=0)return;
    int w=p.width,h=p.height,rs=w*4;
    unsigned char*rgba=malloc(rs*h);if(!rgba)return;
    for(int y=0;y<h;y++)for(int x=0;x<w;x++){
        int i=y*p.stride+x*4,j=y*rs+x*4;
        rgba[j]=p.data[i+2];rgba[j+1]=p.data[i+1];rgba[j+2]=p.data[i];rgba[j+3]=255;
    }
    if(g_on_frame)g_on_frame(w,h,rgba,rs*h,g_userdata);
    free(rgba);
}
static void on_dpc(SpiceChannel*c,gint f,gint w,gint h,gint s,gint sh,gpointer d,gpointer u){cap(c);}
static void on_inv(SpiceChannel*c,gint x,gint y,gint w,gint h,gpointer u){cap(c);}
static void on_ch(SpiceSession*s,SpiceChannel*ch,gpointer d){
    if(SPICE_IS_DISPLAY_CHANNEL(ch)){
        g_signal_connect(ch,"display-primary-create",G_CALLBACK(on_dpc),NULL);
        g_signal_connect(ch,"display-invalidate",G_CALLBACK(on_inv),NULL);
    }else if(SPICE_IS_INPUTS_CHANNEL(ch))g_inputs=ch;
    else if(SPICE_IS_PLAYBACK_CHANNEL(ch))spice_audio_get(s,NULL);
    else if(SPICE_IS_RECORD_CHANNEL(ch))spice_audio_get(s,NULL);
    spice_channel_connect(ch);
}
static void on_dc(SpiceSession*s,gpointer d){log_s("disconnected");if(g_loop){g_main_loop_quit(g_loop);g_loop=NULL;}}

static gpointer tm(gpointer d){
    if(g_quit)return NULL;
    char *host=(char*)d,*port=strchr(host,0)+1,*pw=strchr(port,0)+1;
    if(*pw==0)pw=NULL;

    if(!g_session){
        g_session=spice_session_new();if(!g_session){log_s("session_new failed");return NULL;}
        g_signal_connect(g_session,"channel-new",G_CALLBACK(on_ch),NULL);
        g_signal_connect(g_session,"disconnected",G_CALLBACK(on_dc),NULL);
        log_s("session created");
    }
    g_object_set(g_session,"host",host,"port",port,NULL);
    if(pw)g_object_set(g_session,"password",pw,NULL);
    g_loop=g_main_loop_new(NULL,FALSE);
    log_s("connecting");
    spice_session_connect(g_session);
    g_main_loop_run(g_loop);
    g_loop=NULL;log_s("thread exit");
    free(host);
    return NULL;
}

__declspec(dllexport) void spice_stop(void);
__declspec(dllexport) int spice_start(const char*host,int port,const char*pw,
    f_cb fc,s_cb sc,void*u){
    if(g_thread){spice_stop();}
    g_on_frame=fc;g_on_status=sc;g_userdata=u;
    /* 打包参数到一块内存传给线程 */
    char ps[16];snprintf(ps,16,"%d",port);
    size_t hl=strlen(host)+1,pl=strlen(ps)+1,wl=pw?strlen(pw)+1:1;
    char*blk=malloc(hl+pl+wl);if(!blk)return -1;
    memcpy(blk,host,hl);memcpy(blk+hl,ps,pl);
    if(pw)memcpy(blk+hl+pl,pw,wl);else blk[hl+pl]=0;
    g_thread=g_thread_new("spice",tm,blk);
    return 0;
}
__declspec(dllexport) void spice_stop(void){
    g_quit=1;if(g_session)spice_session_disconnect(g_session);
    if(g_loop){g_main_loop_quit(g_loop);g_loop=NULL;}
    if(g_thread){g_thread_join(g_thread);g_thread=NULL;}
    g_quit=0;g_inputs=NULL;
}
__declspec(dllexport) int spice_is_running(void){return g_session!=NULL?1:0;}
__declspec(dllexport) void spice_send_key(const char*key,int down){
    if(!g_inputs||!SPICE_IS_INPUTS_CHANNEL(g_inputs))return;
    static const struct{const char*n;int s;}m[]={
        {"Enter",0x1C},{"Escape",0x01},{"Backspace",0x0E},{"Tab",0x0F},{" ",0x39},
        {"Shift",0x2A},{"Control",0x1D},{"Ctrl",0x1D},{"Alt",0x38},{"CapsLock",0x3A},
        {"ArrowUp",0xE048},{"ArrowDown",0xE050},{"ArrowLeft",0xE04B},{"ArrowRight",0xE04D},
        {"Delete",0xE053},{"Home",0xE047},{"End",0xE04F},{"PageUp",0xE049},{"PageDown",0xE051},
    };if(!key)return;
    for(size_t i=0;i<sizeof(m)/sizeof(m[0]);i++)if(!strcmp(key,m[i].n)){
        if(down)spice_inputs_channel_key_press(SPICE_INPUTS_CHANNEL(g_inputs),m[i].s);
        else spice_inputs_channel_key_release(SPICE_INPUTS_CHANNEL(g_inputs),m[i].s);return;
    }if(key[0]>='a'&&key[0]<='z'){int sc=0x1E + (key[0]-'a');
        if(down)spice_inputs_channel_key_press(SPICE_INPUTS_CHANNEL(g_inputs),sc);
        else spice_inputs_channel_key_release(SPICE_INPUTS_CHANNEL(g_inputs),sc);}
}
__declspec(dllexport) void spice_send_mouse_move(int x,int y){
    if(g_inputs)spice_inputs_channel_position(SPICE_INPUTS_CHANNEL(g_inputs),x,y,0,0);}
__declspec(dllexport) void spice_send_mouse_button(int btn,int down){
    if(!g_inputs)return;int b=btn==2?3:btn==1?2:1;
    if(down)spice_inputs_channel_button_press(SPICE_INPUTS_CHANNEL(g_inputs),b,b);
    else spice_inputs_channel_button_release(SPICE_INPUTS_CHANNEL(g_inputs),b,0);}
