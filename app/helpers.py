from __future__ import division
import math


class BellCurvePagination(object):
    """
    Bellcurve pagination inspired by
    http://www.gareth53.co.uk/blog/2010/09/bellcurve-concertina-pagination-google-indexing.html
    """

    def __init__(self, page, per_page, total_count, items):
        self.page = page
        self.per_page = per_page
        self.total_count = total_count
        self.items = items

    @property
    def pages(self):
        return int(math.ceil(self.total_count / float(self.per_page)))

    @property
    def pagination(self):
        return self.paginate(self.pages, self.page, 11, 2)

    def bellcurve(self, outer_limit, start, increments):
        #print outer_limit, start, increments
        """Those args are:

        outer_limit: the extent of this range - could be low or high
        start: the "middle" number to start from and work towards the range
        increments: how many steps we have to work with
        """
        # always put the outer limit in the bell-curve
        add_links = [outer_limit]
        # but if we don't have any more steps to populate we can stop
        if increments > 0:
            # keep an eye on where we are in the loop
            curr_pos = start
            # need to know if we're going up or down
            if outer_limit < start:
                # we're going down
                for i in range(1, increments):
                    #new_link = int(math.floor((curr_pos - outer_limit)
                    #    * math.pow(0.5, (increments - i))))
                    new_link = int(math.floor(curr_pos - ((curr_pos - outer_limit)
                        * math.pow(0.5, (increments - i)))))
                    if new_link not in add_links:
                        add_links.append(new_link)
                        curr_pos = new_link
                # move first item to end
                add_links.append(add_links.pop(0))
                # this one needs to be reversed
                add_links.reverse()
            else:
                # up!
                for i in range(1, increments):
                    new_link = int(math.ceil(curr_pos + ((outer_limit - curr_pos)
                        * math.pow(0.5, (increments - i)))))
                    if new_link not in add_links:
                        add_links.append(new_link)
                        curr_pos = new_link
                # move first item to end, but no need to reverse
                add_links.append(add_links.pop(0))
                #print add_links

        return add_links

    def friendly_rounding(self, number, before, after):
        """args

        number: the number we want to have rounded to something friendly
        before: the previous number in our sequence
        after: the next number in our sequence
        """
        # doesn't work very well for low numbers
        if number <= 20:
            return number
        friendly_increments = [5, 10, 25, 50, 75, 100, 250, 500, 1000, 2000, 5000, 7500, 10000]
        # we need to work out what base to use by how faraway the others are
        base = 5
        for i, increment in enumerate(friendly_increments):
            diff = abs(before - increment)
            before_diff = abs(number - before)
            after_diff = abs(after - number)
            #print diff, increment
            if diff < increment or before_diff < increment or after_diff < increment:
                base = increment
                #print 'base is', base
                break
        rounded = int(base * round(float(number) / base))
        #print rounded if rounded != after else number, '->', number
        #return rounded
        val = rounded if rounded != after else rounded - base
        #print number, '->', val
        return val

    def paginate(self, pages, current_page, links, padding):
        #print pages, current_page, links
        # if we have same or less pages than links, just range it
        if pages <= links:
            return range(1, pages + 1)

        # let's work out our "core" links surrounding the current page
        # assuming padding is 1 for now
        start = current_page - padding
        end = current_page + padding

        if start < 2:
            start = 2

        if end > pages - 1:
            end = pages - 1

        core_links = range(start, end + 1)

        remaining_links = links - len(core_links) - 1

        # need to work out how many remaining links go before vs after
        before_range = core_links[0] - 1
        after_range = pages - core_links[-1]
        #print remaining_links
        #print before_range
        #print after_range
        parts = remaining_links / (before_range + after_range)
        #print parts
        #print before_range * parts
        before_links_num = int(round(before_range * parts))
        after_links_num = int(round(after_range * parts))

        #print before_links_num
        #print after_links_num

        before_links = self.bellcurve(1, core_links[0] - 1, before_links_num)
        after_links = self.bellcurve(pages, core_links[-1] + 1, after_links_num)

        #print before_links
        rounded_links = []
        for i in range(len(before_links) - 1, 0, -1):
            #print before_links[i]
            #print before_links[i-1]
            if i == len(before_links) - 1:
                after = core_links[0]
            else:
                after = rounded_links[-1]
                #print rounded_links[-1]
            rounded_links.append(self.friendly_rounding(before_links[i], before_links[i - 1], after))
        rounded_links.reverse()
        #print rounded_links
        rounded_links.insert(0, before_links[0])
        before_links = rounded_links
            #before_links[i] = round_sanely(before_links[i], before_links[i-1], after)

        rounded_links = []
        for j in range(len(after_links) - 2, -1, -1):
            if j == 0:
                before = core_links[-1]
            else:
                before = after_links[j - 1]

            if j == len(after_links) - 2:
                after = after_links[j + 1]
            else:
                after = rounded_links[-1]
            #print before, after_links[j + 1]
            #print after_links[j], before, after
            rounded_links.append(self.friendly_rounding(after_links[j], before, after))
        rounded_links.insert(0, after_links[-1])
        rounded_links.reverse()
        after_links = rounded_links

        #print before_links
        #print after_links
        #print core_links

        if core_links[0] > 2:
            core_links.insert(0, '...')

        if core_links[-2] < pages - 2:
            core_links.append('...')

        core_links.extend(after_links)
        before_links.extend(core_links)

        #print before_links

        #print '-----------------------'

        return before_links


class Pagination(object):
    """
    Pagination class from here: http://flask.pocoo.org/snippets/44/
    """

    def __init__(self, page, per_page, total_count, items):
        self.page = page
        self.per_page = per_page
        self.total_count = total_count
        self.items = items

    @property
    def pages(self):
        return int(math.ceil(self.total_count / float(self.per_page)))

    @property
    def has_prev(self):
        return self.page > 1

    @property
    def has_next(self):
        return self.page < self.pages

    def iter_pages(self, left_edge=2, left_current=2,
                   right_current=5, right_edge=2):
        last = 0
        for num in xrange(1, self.pages + 1):
            if num <= left_edge or \
               (num > self.page - left_current - 1 and \
                num < self.page + right_current) or \
               num > self.pages - right_edge:
                if last + 1 != num:
                    yield None
                yield num
                last = num
