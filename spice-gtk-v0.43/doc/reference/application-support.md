Title: Application Support
Slug: application-support

# Application Support

These objects provide high-level services that applications typically need
when building a SPICE client.

## Audio

[class@SpiceClientGLib.Audio] provides automatic audio playback and
recording by connecting to playback and record channels as they appear.
Use [func@SpiceClientGLib.Audio.get] to obtain the session's audio handler.

## USB Device Manager

[class@SpiceClientGLib.UsbDeviceManager] manages USB device redirection.
It can automatically redirect newly plugged devices based on filter rules,
or let the application explicitly connect and disconnect devices.

```c
SpiceUsbDeviceManager *mgr = spice_usb_device_manager_get(session, NULL);
GPtrArray *devices = spice_usb_device_manager_get_devices(mgr);

for (guint i = 0; i < devices->len; i++) {
    SpiceUsbDevice *dev = g_ptr_array_index(devices, i);
    gchar *desc = spice_usb_device_get_description(dev, NULL);
    g_print("Device: %s\n", desc);
    g_free(desc);
}
```

## Smartcard Manager

[class@SpiceClientGLib.SmartcardManager] manages smartcard readers and
virtual card insertion/removal. Use
[func@SpiceClientGLib.SmartcardManager.get] to obtain the singleton.

## QMP Port

[class@SpiceClientGLib.QmpPort] wraps the QEMU Machine Protocol over
a SPICE port channel, allowing the client to query VM status and
trigger actions like pause, reset, and powerdown.

## Utility Functions

- [func@SpiceClientGLib.get_option_group] — Returns a `GOptionGroup` for
  SPICE command-line options
- [func@SpiceClientGLib.set_session_option] — Applies a `GOptionGroup`
  to a session
- [func@SpiceClientGLib.glib_set_debug] — Enable or disable debug logging
- [func@SpiceClientGLib.glib_get_version_string] — Returns the library
  version string
