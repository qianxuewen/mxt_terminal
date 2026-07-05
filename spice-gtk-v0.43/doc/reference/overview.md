Title: Overview
Slug: overview

# SpiceClientGLib Overview

SpiceClientGLib is the core SPICE client library. It provides a GObject-based
API for connecting to SPICE servers, managing sessions, and communicating over
various channel types.

## Architecture

A SPICE client application typically follows this pattern:

1. Create a [class@SpiceClientGLib.Session] and configure connection parameters
2. Connect to the server with [method@SpiceClientGLib.Session.connect]
3. Listen for [signal@SpiceClientGLib.Session::channel-new] to discover channels
4. Interact with each channel according to its type

## Channel Types

All channels inherit from [class@SpiceClientGLib.Channel]. The available
channel types are:

| Channel | Purpose |
|---------|---------|
| [class@SpiceClientGLib.MainChannel] | Agent communication, clipboard, file transfer, display configuration |
| [class@SpiceClientGLib.DisplayChannel] | Framebuffer updates and GL scanouts |
| [class@SpiceClientGLib.InputsChannel] | Keyboard and mouse input |
| [class@SpiceClientGLib.CursorChannel] | Mouse cursor shape and position |
| [class@SpiceClientGLib.PlaybackChannel] | Audio playback from the server |
| [class@SpiceClientGLib.RecordChannel] | Audio recording to the server |
| [class@SpiceClientGLib.UsbredirChannel] | USB device redirection |
| [class@SpiceClientGLib.SmartcardChannel] | Smartcard passthrough |
| [class@SpiceClientGLib.PortChannel] | Generic named data channels |
| [class@SpiceClientGLib.WebdavChannel] | Shared folder access via WebDAV |

## Helper Objects

Several singleton-style objects provide application-level services:

- [class@SpiceClientGLib.Audio] — Automatic audio playback and recording
- [class@SpiceClientGLib.SmartcardManager] — Smartcard reader management
- [class@SpiceClientGLib.UsbDeviceManager] — USB device redirection management
- [class@SpiceClientGLib.QmpPort] — QEMU Machine Protocol over a SPICE port channel
