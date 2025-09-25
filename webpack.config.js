import path from 'path';
import { fileURLToPath } from 'url';
import HtmlWebpackPlugin from 'html-webpack-plugin';

// Получаем __dirname в ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  mode: 'development', // или 'production'
  entry: './src/client/index.js', // Entry point
  output: {
    path: path.resolve(__dirname, 'dist'), // Куда положить бандл
    filename: 'main.js', // Имя бандла
    clean: true, // Очищать папку dist перед сборкой
  },
  module: {
    rules: [
      // Babel для JS (если нужен)
      { 
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          },
        },
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'images/[name][hash][ext]',
        },
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      }
    ],
  },
  plugins: [
    // Автоматически добавляет скрипт в HTML
    new HtmlWebpackPlugin({
        template: './src/client/index.html',
        filename: 'index.html',       // Имя выходного файла (по умолчанию)
        inject: 'body' 
    })
  ],
  devServer: {
    proxy: [
    {
      context: ['/api'], // какие запросы проксировать
      target: 'http://localhost:7070', // куда прокидывать
      changeOrigin: true,
    },
    ],
    static: {
      directory: path.join(__dirname, 'dist'), // Откуда раздавать файлы
    },
    compress: true,
    port: 8080, // Порт сервера
    open: true, // Автооткрытие в браузере
  },
};