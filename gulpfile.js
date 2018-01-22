'use strict';

const customConfig = { server: { test: { filePatterns: ['lib/**/*.spec.js'] } } };

const gulp = require('gulp');
const tasks = require('boar-tasks-server').getTasks(gulp, customConfig);

gulp.task('test', ['server-test']);
gulp.task('server-test', tasks.server.test);

gulp.task('style', ['server-style']);
gulp.task('server-style', tasks.server.codeStyle);

gulp.task('default', ['style', 'test']);
