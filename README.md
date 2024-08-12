# owopfuck.v2

owopfuck.v2 is an advanced client and bot system for Our World of Pixels (OWOP), a collaborative online pixel art platform.

## Features

- Custom UI with multiple tabs for different functionalities
- Bot management system
- Proxy support
- Asset management
- Various drawing tools and patterns
- Terrain generation
- WebSocket hijacking for client-side automation
- Captcha handling

## Installation

1. Clone the repository:
    ```
    git clone https://github.com/scar17off/owopfuck.v2.git
    cd owopfuck.v2
    ```
2. Install dependencies:
   ```
   npm install
   ```
3. Build the project:
   ```
   npm run build
   ```

## Usage

After building the project, you can load the generated `owopfuck.user.js` file as a userscript in your browser.

To open the main menu, use the configured key (default is F4).

## Configuration

The project uses a configuration system that can be customized in `src/core/config.js`.

## Main Components

1. Client (OJS): Handles connection to OWOP servers and provides basic functionality
2. UI Library: Custom UI system for creating windows and controls
3. Tools: Various drawing tools and patterns
4. Asset Management: System for uploading and managing image assets
5. Botnet: Allows control of multiple bots simultaneously
6. Proxy Management: System for adding and using proxies

## Development

To work on the project:

1. Make your changes in the `src` directory
2. Run the build command to generate the updated userscript:
   ```
   npm run build
   ```

## Contributing

Contributions are welcome. Please open an issue to discuss proposed changes or submit a pull request.

## License

This project is licensed under the ISC License.

## Disclaimer

This project is for educational purposes only. Use responsibly and in accordance with OWOP's terms of service.