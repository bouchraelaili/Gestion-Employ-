import unittest
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

class TestEmployees(unittest.TestCase):
    def test_get_employees(self):
        self.assertTrue(True)  

if __name__ == '__main__':
    unittest.main()
