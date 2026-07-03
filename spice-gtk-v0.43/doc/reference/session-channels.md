Title: Session and Channels
Slug: session-channels

# Session and Channels

## Session

The [class@SpiceClientGLib.Session] is the entry point for any SPICE connection.
It manages the lifecycle of all channels and holds connection parameters such as
host, port, and TLS settings.

```c
SpiceSession *session = spice_session_new();
g_object_set(session, "host", "localhost", "port", "5900", NULL);

g_signal_connect(session, "channel-new",
                 G_CALLBACK(on_channel_new), NULL);

spice_session_connect(session);
```

## Channel Base Class

[class@SpiceClientGLib.Channel] is the abstract base class for all SPICE
channels. It provides common functionality like capability negotiation and
connection state management.

## Main Channel

The [class@SpiceClientGLib.MainChannel] is always present in a SPICE session.
It handles:

- **Agent communication** — Testing agent capabilities and exchanging messages
- **Clipboard sharing** — Copy/paste between client and guest
- **File transfer** — Sending files to the guest via drag-and-drop or API
- **Display configuration** — Informing the server about monitor layout
- **Mouse mode** — Requesting client or server mouse mode

File transfers are tracked through [class@SpiceClientGLib.FileTransferTask]
objects emitted by the [signal@SpiceClientGLib.MainChannel::new-file-transfer]
signal.

## Display Channel

The [class@SpiceClientGLib.DisplayChannel] delivers the guest display. It
supports both software rendering (via primary surface updates) and hardware
accelerated rendering (via GL scanouts with `EGL_MESA_image_dma_buf_export`).

Key signals:
- [signal@SpiceClientGLib.DisplayChannel::display-primary-create] — A new
  framebuffer is available
- [signal@SpiceClientGLib.DisplayChannel::display-invalidate] — A region
  needs redrawing
- [property@SpiceClientGLib.DisplayChannel:gl-scanout] — A new OpenGL scanout is
  available
- [signal@SpiceClientGLib.DisplayChannel::gl-draw] — An OpenGL region
  needs redrawing

## Inputs Channel

The [class@SpiceClientGLib.InputsChannel] sends keyboard and mouse events to
the guest. It supports both client-mode (absolute coordinates) and server-mode
(relative motion) mouse input.

## Cursor Channel

The [class@SpiceClientGLib.CursorChannel] receives mouse cursor shape and
position updates from the guest, delivered as
[struct@SpiceClientGLib.CursorShape] data.

## Audio Channels

- [class@SpiceClientGLib.PlaybackChannel] — Receives audio data from the guest
- [class@SpiceClientGLib.RecordChannel] — Sends audio data to the guest

## Port Channel

The [class@SpiceClientGLib.PortChannel] provides named, bidirectional data
channels that applications can use for custom communication with the guest.

## Other Channels

- [class@SpiceClientGLib.UsbredirChannel] — Carries USB device traffic
- [class@SpiceClientGLib.SmartcardChannel] — Carries smartcard APDU traffic
- [class@SpiceClientGLib.WebdavChannel] — Carries WebDAV shared folder traffic
