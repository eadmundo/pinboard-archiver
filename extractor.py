#!/usr/bin/env python
# -*- coding: utf-8 -*-

from __future__ import with_statement

import sys
import os

from boilerpipe.extract import Extractor

sys.path.insert(0, os.path.abspath('..'))

from clint import args


if __name__ == '__main__':

    html_file = args.get(0)
    html = open(html_file).read()
    extractor = Extractor(extractor='ArticleExtractor', html=html)
    print extractor.getText().encode('utf-8')
