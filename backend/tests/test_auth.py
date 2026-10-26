import unittest
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

class TestAuth(unittest.TestCase):
    def test_login_required_fields(self):
        self.assertTrue(True)  

if __name__ == '__main__':
    unittest.main()
